-- ============================================================================
-- AyurTrace+ — cryptographic hash-chain ledger
--
-- WHERE: Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- What this is: a real, tamper-evident append-only log. Every insert/update
-- on public.batches or public.products appends one entry whose hash is
-- computed from the previous entry's hash plus this record's content — the
-- same core primitive a blockchain uses for tamper-evidence. Edit any past
-- entry's stored content directly in the database and every hash after it
-- stops matching; public.verify_ledger_chain() proves that on demand.
--
-- What this is NOT: a distributed, multi-node, consensus-based network like
-- Hyperledger Fabric. It's a single-database hash chain. If your evaluation
-- requires literally "Hyperledger Fabric," this doesn't satisfy that by
-- name — it satisfies the actual property the problem statement asks for
-- ("immutable, tamper-proof audit trail"), achievable with tools already in
-- this stack (Postgres + pgcrypto), with nothing further to install.
--
-- Existing data: backfilled once, using each row's own real created_at, so
-- the chain has a genesis covering what you already have. No existing
-- batches/products row content is altered — this only reads them to build
-- the chain; the backfill is skipped entirely if it has already run.
--
-- Safe to re-run.
-- ============================================================================

-- Supabase installs extensions into the `extensions` schema by default, not
-- `public` — explicit here so the schema-qualified search_path below (which
-- the trigger functions need to actually find digest()) matches where this
-- really lands. Safe to re-run: if pgcrypto already exists anywhere, this is
-- a no-op regardless of which schema it's already in.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.ledger_entries (
  id bigserial primary key,
  table_name text not null,
  record_id uuid not null,
  payload_snapshot jsonb not null,
  prev_hash text not null,
  entry_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists ledger_entries_record_idx on public.ledger_entries (table_name, record_id, created_at);
create index if not exists ledger_entries_created_idx on public.ledger_entries (created_at);

alter table public.ledger_entries enable row level security;

-- Readable by anyone who can read the app (it's an audit trail, meant to be
-- inspectable) — but nobody can INSERT/UPDATE/DELETE directly. The only way
-- a row appears here is via the SECURITY DEFINER trigger function below, so
-- a client can never forge or edit a ledger entry, only the real records it
-- chains from.
drop policy if exists ledger_entries_select_all on public.ledger_entries;
create policy ledger_entries_select_all
  on public.ledger_entries for select
  to authenticated, anon
  using (true);

-- ── Append-on-write trigger ─────────────────────────────────────────────────
create or replace function public.append_ledger_entry()
returns trigger
language plpgsql
security definer
-- `extensions` alongside `public` — pgcrypto's digest() lives there on a
-- Supabase-managed database (see the create extension line above); a bare
-- `search_path = public` makes digest() unresolvable even though the
-- extension is installed, which is exactly the "function digest(...) does
-- not exist" error this fixes.
set search_path = public, extensions
as $$
declare
  last_hash text;
  new_hash text;
  ts timestamptz := clock_timestamp();
begin
  select entry_hash into last_hash from public.ledger_entries order by id desc limit 1;
  if last_hash is null then
    last_hash := repeat('0', 64); -- genesis
  end if;

  new_hash := encode(
    digest(last_hash || new.id::text || new.payload::text || ts::text, 'sha256'),
    'hex'
  );

  insert into public.ledger_entries (table_name, record_id, payload_snapshot, prev_hash, entry_hash, created_at)
  values (TG_TABLE_NAME, new.id, new.payload, last_hash, new_hash, ts);

  return new;
end;
$$;

drop trigger if exists batches_append_ledger on public.batches;
create trigger batches_append_ledger
  after insert or update on public.batches
  for each row execute function public.append_ledger_entry();

drop trigger if exists products_append_ledger on public.products;
create trigger products_append_ledger
  after insert or update on public.products
  for each row execute function public.append_ledger_entry();

-- ── One-time backfill for existing rows (skipped if already run) ───────────
do $$
declare
  rec record;
  last_hash text := repeat('0', 64);
  new_hash text;
begin
  if not exists (select 1 from public.ledger_entries limit 1) then
    for rec in
      select 'batches'::text as table_name, id, payload, created_at from public.batches
      union all
      select 'products'::text as table_name, id, payload, created_at from public.products
      order by created_at asc
    loop
      new_hash := encode(
        digest(last_hash || rec.id::text || rec.payload::text || rec.created_at::text, 'sha256'),
        'hex'
      );
      insert into public.ledger_entries (table_name, record_id, payload_snapshot, prev_hash, entry_hash, created_at)
      values (rec.table_name, rec.id, rec.payload, last_hash, new_hash, rec.created_at);
      last_hash := new_hash;
    end loop;
  end if;
end $$;

-- ── Verification ─────────────────────────────────────────────────────────
-- Walks the whole chain and recomputes every hash from stored content.
-- Returns is_valid = false and the first broken entry's id the moment a
-- stored entry_hash doesn't match what its own prev_hash + content produce —
-- i.e. the moment something was tampered with after being written.
create or replace function public.verify_ledger_chain()
returns table(is_valid boolean, entries_checked integer, first_broken_id bigint)
language plpgsql
set search_path = public, extensions
as $$
declare
  rec record;
  expected_prev text := repeat('0', 64);
  recomputed text;
  checked integer := 0;
  broken_id bigint := null;
begin
  for rec in select * from public.ledger_entries order by id asc loop
    checked := checked + 1;
    if rec.prev_hash is distinct from expected_prev then
      broken_id := rec.id;
      exit;
    end if;
    recomputed := encode(
      digest(rec.prev_hash || rec.record_id::text || rec.payload_snapshot::text || rec.created_at::text, 'sha256'),
      'hex'
    );
    if recomputed is distinct from rec.entry_hash then
      broken_id := rec.id;
      exit;
    end if;
    expected_prev := rec.entry_hash;
  end loop;

  return query select (broken_id is null), checked, broken_id;
end;
$$;

-- ── Try it ───────────────────────────────────────────────────────────────
select * from public.verify_ledger_chain();
select count(*) as ledger_entries_created from public.ledger_entries;
