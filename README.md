# HerbChain / AyurTrace

An end-to-end herb supply-chain traceability platform: from a farmer's
collection event, through processing, manufacturing and shipment, to a
customer scanning a QR code on the finished product — with an optional
Hyperledger Fabric ledger recording the same events immutably for tamper
detection.

The project is a monorepo of four independent subsystems plus a set of
shared cloud services (MongoDB, Supabase, Gemini, Razorpay, Hyperledger
Fabric). No subsystem imports another directly — they integrate only
through those shared services, which is why each one can be developed,
deployed, and (mostly) run on its own.

| Subproject | What it is | Stack |
|---|---|---|
| [`herbchain_app`](sss/herbchain_app) | Customer-facing mobile app | Expo / React Native, expo-router, Zustand |
| [`herbchain_backend`](sss/herbchain_backend) | REST API: auth, catalog, orders, chat, health/doctor features | Express 5, TypeScript, MongoDB/Mongoose |
| [`herbchain_web`](sss/herbchain_web) | Staff dashboard (Farmer/Collection/Processing/Manufacturer/Government) + public QR verify page | React 19, Vite, Supabase |
| [`herbchain_fabric`](sss/herbchain_fabric) | Blockchain provenance layer (chaincode + network + relay) | Hyperledger Fabric, Node/TypeScript |

## System architecture

Two independent write paths converge on Supabase, which doubles as the
shared "blockchain status" bulletin board between the web app and the
Fabric layer. `herbchain_web` and `herbchain_backend` never call the Fabric
relay directly, and the relay never calls them back either — it only
reacts to Supabase Database Webhooks and writes its results onto the same
Supabase rows, so the blockchain layer can be turned on, off, or rebuilt
without touching either application.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full system diagram and a
sequence diagram tracing one batch from farm collection to a customer
viewing it. See [`herbchain_fabric/README.md`](sss/herbchain_fabric/README.md)
for the Fabric layer's own wiring diagram and current status (**built, not
yet running end-to-end** as of this writing).

## Running everything locally

Each subproject has its own `.env` — see its README for the full variable
list. Rough order to bring the stack up for local development:

1. **`herbchain_backend`** — the API most of the others read from.
   ```bash
   cd sss/herbchain_backend
   npm install
   docker-compose up -d mongodb   # or a local MongoDB install
   npm run dev                    # http://localhost:3000, Swagger at /api-docs
   ```
2. **`herbchain_web`** — staff dashboard + public verify page.
   ```bash
   cd sss/herbchain_web
   npm install
   npm run dev                    # http://localhost:5173
   ```
3. **`herbchain_app`** — mobile app. Point `EXPO_PUBLIC_API_BASE_URL` at
   your backend (LAN IP for a physical device/emulator, not `localhost`)
   and `EXPO_PUBLIC_VERIFY_BASE_URL` at the web app.
   ```bash
   cd sss/herbchain_app
   npm install
   npx expo start
   ```
4. **`herbchain_fabric`** — optional; only needed to exercise the
   blockchain layer. See its README for bringing up the network, deploying
   the chaincode, and running the relay — this is the most involved piece
   and is not required for the app/web/backend to function.

## Shared services this project depends on

| Service | Used by | Purpose |
|---|---|---|
| MongoDB | `herbchain_backend` | Catalog, orders, auth (non-customer roles), chat history, doctor/health data |
| Supabase | `herbchain_web`, `herbchain_app`, `herbchain_fabric/relay`, `herbchain_backend` (read-only) | Operational data (batches/products/payments), customer accounts/auth, shared blockchain-status columns |
| Gemini API | `herbchain_backend` | AI chatbot (falls back to a deterministic summary if no key is set) |
| Razorpay | `herbchain_backend` | Order payments |
| Hyperledger Fabric | `herbchain_fabric` | Immutable provenance ledger for tamper detection |

## Deployment notes

- `herbchain_backend` is a long-lived Node process (Socket.IO/WebSockets),
  so it needs a container host (Railway/Render/Fly/a VM) rather than a
  serverless platform.
- `EXPO_PUBLIC_*` / `VITE_*` env vars are baked in at build time, not read
  at runtime — changing them requires a rebuild, not just a restart.
- A LAN IP (used for local device testing) only works while the phone and
  the backend are on the same network; production needs a stable public
  domain for `EXPO_PUBLIC_API_BASE_URL`.
