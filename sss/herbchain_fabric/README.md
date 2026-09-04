# AyurTrace+ — Hyperledger Fabric provenance layer

**Status as of this writing: built, not yet running.** No part of this has
been started, connected, or tested end-to-end — this repo did not have
Docker, WSL2, or Go installed when this was written, and Fabric cannot run
without a container runtime. Nothing here should be described as "confirmed"
or "live" until you've actually run the commands below and they've
succeeded. See "Proving it's real" at the bottom for exactly what evidence
to expect at each step.

## What this is, and isn't

This is an **additive, standalone** system living beside `herbchain_web`,
`herbchain_backend`, and `herbchain_app` — none of those three apps have
been modified to depend on this. `herbchain_web` continues writing directly
to Supabase exactly as it always has; this system watches those writes via
a Supabase Database Webhook and, asynchronously, records the corresponding
event on a real Hyperledger Fabric ledger.

```
herbchain_web (unchanged)
      │
      ▼
Supabase (unchanged tables, +4 new nullable columns per table — see
          herbchain_web/sql/add_blockchain_metadata.sql)
      │
      │ Database Webhook (configured in Supabase Dashboard, not code)
      ▼
relay/  (this repo) ──────► network/ (Fabric: 3 orgs, 1 channel, 1 chaincode)
      │
      └─ writes blockchain_tx_id / blockchain_status back onto the same row
```

## Layout

```
herbchain_fabric/
  chaincode/ayurtrace-chaincode/   the smart contract (TypeScript, fabric-contract-api)
  network/                          docker-compose + configtx + crypto-config + bring-up scripts
  relay/                            Node service: Supabase webhook → Fabric Gateway → Supabase write-back
```

## Prerequisites

- Docker Desktop with WSL2 backend (Windows) — you're installing this now.
- Fabric binaries + Docker images: run Hyperledger's official installer, which
  is the standard way to get `cryptogen`, `configtxgen`, `osnadmin`, `peer`
  on PATH, and pulls the `fabric-peer`/`fabric-orderer` images this
  docker-compose.yaml expects:
  ```bash
  curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh
  chmod +x install-fabric.sh
  ./install-fabric.sh docker binary
  # then add the downloaded ./bin directory to your PATH
  ```
- Node.js 18+ (already installed, per herbchain_web's own requirements).

## Bringing the network up

```bash
cd herbchain_fabric/network
chmod +x scripts/*.sh
./scripts/generate-crypto.sh     # generates crypto-config/ + channel-artifacts/
./scripts/network-up.sh          # docker compose up + joins all 4 nodes to ayurtrace-channel

cd ../chaincode/ayurtrace-chaincode
npm install
npm run build                    # compiles src/ → dist/, which is what gets packaged

cd ../../network
./scripts/deploy-chaincode.sh    # package → install (x3 orgs) → approve (x3) → commit
```

The last line of `deploy-chaincode.sh` runs a real `peer chaincode query`
against `GetProvenance` on a batch that doesn't exist — an empty `[]`
response (not a connection error) is your first real evidence the chaincode
is live and answering queries.

## Running the relay

```bash
cd herbchain_fabric/relay
cp .env.example .env
# fill in SUPABASE_SERVICE_ROLE_KEY and WEBHOOK_SHARED_SECRET
npm install
npm run build
npm start
```

Then in the Supabase Dashboard: **Database → Webhooks → Create a new webhook**,
once each for `batches`, `products`, `payments` — Insert + Update events,
HTTP POST to `http://<relay-host>:4400/webhook/batches` (etc.), with an
`x-webhook-secret` header matching `.env`'s `WEBHOOK_SHARED_SECRET`. (For a
local relay during development, Supabase needs a way to reach your machine —
`ngrok http 4400` or similar, since Supabase's cloud can't reach `localhost`
directly.)

## Enabling this in `herbchain_web` (not done yet — deliberately)

Three small, additive changes, held back until you've confirmed the pipeline
above is actually working end-to-end:

1. **Run `herbchain_web/sql/add_blockchain_metadata.sql`** in the Supabase
   SQL Editor.
2. **Flip three `.select('id, payload')` calls back to
   `.select('id, payload, blockchain_tx_id, blockchain_status')`** in
   `useBatchStore.ts` (I reverted these back to plain `'id, payload'` this
   session specifically because selecting a column that doesn't exist yet
   returns a hard Postgrest error — i.e. running this before step 1 would
   break batch loading outright). Do the equivalent for `useProductStore.ts`,
   which hasn't been touched yet.
3. **Drop `<BlockchainStatusBadge status={batch.blockchainStatus} txId={batch.blockchainTxId} />`**
   (already built — `herbchain_web/src/components/BlockchainStatusBadge.tsx`)
   next to the existing status pill in `ProductCatalogue.tsx`, and the same
   pattern in `ProductTraceability.tsx`'s per-stage pill row (next to the
   existing Certificate/Receipt pills) and `AuditLogs.tsx`'s already-existing
   "Ledger" column.

Tell me once the network + relay are confirmed running and I'll do this
final wiring pass — it's a five-minute change once the data is actually
flowing.

## Proving it's real (per the brief: never claim success without evidence)

At each stage, the evidence that matters:

| Claim | What to actually check |
|---|---|
| "Fabric network is running" | `docker ps` shows `orderer1`, 3× `peer0.*`, 3× `couchdb0.*`, all `Up` |
| "Channel exists" | `deploy-chaincode.sh`'s final `peer chaincode query` returns `[]`, not a connection error |
| "Chaincode is committed" | `peer lifecycle chaincode querycommitted --channelID ayurtrace-channel --name ayurtrace-chaincode` shows sequence 1, approved by all 3 orgs |
| "A transaction happened" | The relay's own log line `[relay] batches.<id> → CreateCollectionEvent` followed by a real hex-ish Fabric tx ID (Fabric tx IDs are 64-char hex SHA-256 digests — nothing like the old `0x${Math.random()...}` mock) |
| "Supabase reflects it" | `select blockchain_tx_id, blockchain_status from batches where id = '<id>'` shows `CONFIRMED` and a real tx id |
| "Tamper detection works" (§18) | Manually edit a `batches.payload->>'quantity'` value in the SQL editor, then re-run `GetProvenance` for that batch via the relay's `/api/blockchain/provenance/:batchId` — the Fabric-side quantity (captured at CreateCollectionEvent/CreateBatch time, immutable) will now disagree with the Supabase value. Comparing the two is the mismatch check from §18; nothing here auto-flags it as a banner yet — that's a UI addition for a later pass once the base pipeline is proven. |

If any of these don't check out, that's the actual, current state — report it
back rather than treating a config file existing as equivalent to a running
system.
