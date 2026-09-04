-- ============================================================================
-- AyurTrace+ — NMPB-style annual harvest quota per species
--
-- WHERE: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Requires add_species_collection_rules.sql to have been run first (this
-- adds a column to the public.species_rules table it creates).
--
-- Context: species_rules already gates *where* and *when* a species may be
-- harvested, but nothing tracks *how much* — a region under real NMPB-style
-- conservation management also has an annual sustainable-yield ceiling, and
-- today nothing on the government dashboard shows how close the network is
-- to it. This adds that ceiling per species and is read (select-only, same
-- policy as the rest of species_rules) by the Government Analytics page to
-- compute a real depletion-rate metric from actual collected quantities —
-- not a simulated number.
--
-- Honesty note on scope: quota figures are illustrative, sized around what a
-- demo network of a few dozen batches would plausibly approach — not
-- official NMPB-published district quotas. A species with no quota
-- configured here is simply left out of the depletion metric.
--
-- Safe to re-run.
-- ============================================================================

alter table public.species_rules
  add column if not exists annual_quota_kg numeric;

update public.species_rules set annual_quota_kg = 500  where species = 'Ashwagandha';
update public.species_rules set annual_quota_kg = 2000 where species = 'Turmeric';
update public.species_rules set annual_quota_kg = 800  where species = 'Amla (Indian Gooseberry)';
update public.species_rules set annual_quota_kg = 150  where species = 'Brahmi';
update public.species_rules set annual_quota_kg = 300  where species = 'Tulsi (Holy Basil)';

-- ── Verification ────────────────────────────────────────────────────────────
select species, annual_quota_kg from public.species_rules order by species;
