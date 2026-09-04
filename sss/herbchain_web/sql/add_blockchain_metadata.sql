-- ============================================================================
-- AyurTrace+ — blockchain provenance metadata (additive only)
--
-- WHERE: Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Context: this adds columns for a REAL Hyperledger Fabric integration living
-- outside this repo (see /herbchain_fabric at the monorepo root — a Fabric
-- network + chaincode + a small Node relay service). It does NOT touch any
-- existing column, table, policy, or the app's `payload` jsonb shape.
--
-- These columns are populated asynchronously, by the relay service, AFTER a
-- Supabase write already succeeded — never by the app itself. That's why
-- they're real physical columns (not `generated always as (payload->>...)`
-- like every other column here): nothing in `payload` ever holds this data:
-- it doesn't exist at the moment the app writes the row, only after Fabric
-- has (or hasn't) confirmed the transaction.
--
-- The existing application must keep working with these columns entirely
-- NULL — that is in fact their default, permanent state until the relay
-- service is deployed and Fabric is actually running. No existing read or
-- write path in herbchain_web touches these columns, so nothing breaks by
-- adding them.
--
-- Safe to re-run.
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'blockchain_status') then
    create type public.blockchain_status as enum ('PENDING', 'CONFIRMED', 'FAILED');
  end if;
end $$;

alter table public.batches
  add column if not exists blockchain_tx_id   text,
  add column if not exists blockchain_status  public.blockchain_status,
  add column if not exists blockchain_asset_id text,
  add column if not exists blockchain_network text;

alter table public.products
  add column if not exists blockchain_tx_id   text,
  add column if not exists blockchain_status  public.blockchain_status,
  add column if not exists blockchain_asset_id text,
  add column if not exists blockchain_network text;

alter table public.payments
  add column if not exists blockchain_tx_id   text,
  add column if not exists blockchain_status  public.blockchain_status,
  add column if not exists blockchain_asset_id text,
  add column if not exists blockchain_network text;

create index if not exists batches_blockchain_status_idx  on public.batches (blockchain_status);
create index if not exists products_blockchain_status_idx on public.products (blockchain_status);
create index if not exists payments_blockchain_status_idx on public.payments (blockchain_status);

-- ── Relay-service write path ────────────────────────────────────────────────
-- The relay authenticates to Supabase with the service-role key (server-side
-- only, never shipped to any frontend), which bypasses RLS entirely — so no
-- new UPDATE policy is needed for it. Existing SELECT policies on these three
-- tables already allow authenticated (+ anon, for the documented demo reasons
-- in each table's own migration) to read the new columns — no policy change
-- required for the UI badges to read blockchain_status/blockchain_tx_id.

-- ── Database Webhooks (configure in the Dashboard, not SQL) ────────────────
-- Supabase Dashboard → Database → Webhooks → Create a new webhook, once each
-- for batches / products / payments:
--   Table: public.batches   (repeat for products, payments)
--   Events: INSERT, UPDATE
--   Type: HTTP Request → POST
--   URL: <your relay service URL>/webhook/batches   (…/products, …/payments)
--   HTTP Headers: add a shared-secret header (see herbchain_fabric/relay/.env.example)
-- This is the "Frontend → Backend → Supabase ┬→ Fabric" fan-out from the
-- brief, implemented without the frontend ever knowing Fabric exists.

-- ── Verification ────────────────────────────────────────────────────────────
select
  column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('batches', 'products', 'payments')
  and column_name like 'blockchain_%'
order by table_name, column_name;
