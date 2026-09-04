-- ============================================================================
-- AyurTrace+ — payments table
--
-- WHERE: Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Context: every role's "Payments" screen (CollectionPayments.tsx,
-- processing/manufacturer/supply-chain Payments.tsx, GovPayments.tsx) has
-- always read from a static `mockPayments` array — a payment could never
-- actually be recorded, and the figures never moved. This gives payments a
-- real home, the same shape as public.batches / public.products: the whole
-- Payment object lives in `payload` (jsonb), with queryable projections
-- generated from it.
--
-- A payment is a record of custody changing hands *with money attached* — the
-- proof-of-sale a farmer or wild collector can point to. It is not public
-- like public.products (no consumer ever needs to see what a collector was
-- paid): access follows the same member-only pattern as public.batches.
--
-- Safe to re-run.
-- ============================================================================

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),

  -- The complete Payment object as the app models it.
  payload jsonb not null,

  -- Derived, queryable projections of payload. Never written directly.
  batch_id       text generated always as (payload->>'batchId')       stored,
  stage          text generated always as (payload->>'stage')         stored,
  status         text generated always as (payload->>'status')        stored,
  recipient_role text generated always as (payload->>'recipientRole') stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_batch_id_idx       on public.payments (batch_id);
create index if not exists payments_stage_idx          on public.payments (stage);
create index if not exists payments_status_idx         on public.payments (status);
create index if not exists payments_recipient_role_idx on public.payments (recipient_role);
create index if not exists payments_created_at_idx     on public.payments (created_at desc);

-- ── updated_at ──────────────────────────────────────────────────────────────
create or replace function public.set_payments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_payments_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Member-only, same pattern as public.batches: every stage needs to read and
-- record payments, and (per that file's note) the Government demo account has
-- no real Supabase JWT and reads as anon, so anon is granted the same access
-- until every role has a real Auth account.
alter table public.payments enable row level security;

drop policy if exists payments_select_authenticated on public.payments;
create policy payments_select_authenticated
  on public.payments for select
  to authenticated
  using (true);

drop policy if exists payments_insert_authenticated on public.payments;
create policy payments_insert_authenticated
  on public.payments for insert
  to authenticated
  with check (true);

drop policy if exists payments_update_authenticated on public.payments;
create policy payments_update_authenticated
  on public.payments for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists payments_select_anon on public.payments;
create policy payments_select_anon
  on public.payments for select
  to anon
  using (true);

drop policy if exists payments_insert_anon on public.payments;
create policy payments_insert_anon
  on public.payments for insert
  to anon
  with check (true);

drop policy if exists payments_update_anon on public.payments;
create policy payments_update_anon
  on public.payments for update
  to anon
  using (true)
  with check (true);

-- No DELETE policy — a payment is an audit record, same reasoning as batches/products.

-- ── Data API grants ─────────────────────────────────────────────────────────
grant select, insert, update on public.payments to authenticated, anon;

-- ── Verification ────────────────────────────────────────────────────────────
select
  (select count(*) from public.payments) as payment_rows,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'payments') as policies;
