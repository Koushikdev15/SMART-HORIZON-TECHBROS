-- ============================================================================
-- AyurTrace+ — short zone label per species, for client-side auto-fill
--
-- WHERE: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Requires add_species_collection_rules.sql to have been run first.
--
-- Context: CreateBatch.tsx used to ask the collector to type the harvest
-- region as free text. That's backwards for a species with a configured
-- geo-fence — the zone is already known from the rule the collector's GPS
-- just matched, and the region-label wording in `notes` is a full sentence
-- (e.g. "Rajasthan belt (Nagaur/Pratapgarh) — India's best-known Ashwagandha
-- growing region...") not fit for a form field. This adds a short label the
-- app fetches (read-only, same policy as the rest of species_rules) and
-- fills in automatically once a real-time GPS reading matches the species'
-- approved belt — see CreateBatch.tsx's `zoneRule` lookup.
--
-- Safe to re-run.
-- ============================================================================

alter table public.species_rules
  add column if not exists zone_label text;

update public.species_rules set zone_label = 'Rajasthan (Nagaur/Pratapgarh)'    where species = 'Ashwagandha';
update public.species_rules set zone_label = 'Erode, Tamil Nadu'                where species = 'Turmeric';
update public.species_rules set zone_label = 'Pratapgarh, Uttar Pradesh'        where species = 'Amla (Indian Gooseberry)';
update public.species_rules set zone_label = 'Kerala/Nilgiris wetlands'         where species = 'Brahmi';
update public.species_rules set zone_label = 'Madhya Pradesh'                   where species = 'Tulsi (Holy Basil)';

-- ── Verification ────────────────────────────────────────────────────────────
select species, zone_label from public.species_rules order by species;
