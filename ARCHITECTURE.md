# Architecture diagrams

Supporting diagrams for [README.md](README.md). See that file for the
full written explanation of each subproject and how they connect.

## System architecture

Two independent write paths converge on Supabase, which doubles as the
shared "blockchain status" bulletin board between the web app and the
Fabric layer:

![HerbChain / AyurTrace system architecture](architecture-diagram.svg)

Key point: **`herbchain_web` and `herbchain_backend` never call the Fabric
relay directly**, and the relay never calls them back either. The relay
only reacts to Supabase Database Webhooks and writes its results onto the
same Supabase rows — so the blockchain layer can be turned on, off, or
rebuilt without touching either application. See
[`herbchain_fabric/README.md`](sss/herbchain_fabric/README.md) for the full
wiring diagram and current status (**built, not yet running end-to-end**
as of this writing).

## Data flow: one batch, farm to phone

```mermaid
sequenceDiagram
    participant Farmer as Collection staff<br/>(herbchain_web)
    participant Supa as Supabase
    participant Relay as Fabric relay
    participant Chain as Hyperledger Fabric
    participant Backend as herbchain_backend
    participant App as Customer<br/>(herbchain_app)

    Farmer->>Supa: insert collection event / batch
    Supa-->>Relay: webhook: batches INSERT
    Relay->>Chain: CreateCollectionEvent + CreateBatch
    Chain-->>Relay: tx id
    Relay->>Supa: update blockchain_tx_id, blockchain_status=CONFIRMED

    Farmer->>Supa: update batch (lab test, processing, approval)
    Supa-->>Relay: webhook: batches UPDATE
    Relay->>Chain: AddQualityTest / AddProcessingStep / ApproveBatch
    Chain-->>Relay: tx id
    Relay->>Supa: update blockchain_tx_id, blockchain_status

    App->>Backend: GET product / verify batch
    Backend->>Backend: read Mongo (catalog, orders)
    Backend->>Supa: read blockchain_tx_id / blockchain_status
    Backend-->>App: product + provenance + blockchain status
```
