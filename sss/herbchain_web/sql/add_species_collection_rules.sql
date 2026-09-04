-- ============================================================================
-- AyurTrace+ — species collection rules (real, database-enforced gate)
--
-- WHERE: Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Context: public.batches currently has no server-side validation at all —
-- any authenticated (or even anon) client can insert or update any payload.
-- This adds the first real, enforced rule layer: a species' approved
-- harvesting region, harvest season, and (once recorded) moisture ceiling are
-- now checked by the database itself, not just implied by a form field.
--
-- Honesty note on scope: this seeds real, well-documented traditional
-- growing belts for a handful of species (Ashwagandha/Rajasthan, Turmeric/
-- Erode, Amla/Pratapgarh, Brahmi/Kerala wetlands, Tulsi/Madhya Pradesh) —
-- not official NMPB-surveyed polygons, and not all 53 species in
-- HERB_MASTER_DB. A species with no row in species_rules is simply not
-- gated (same as today), so nothing already working is broken by this.
-- More species/precise polygons can be added later with no schema change.
--
-- Safe to re-run.
-- ============================================================================

create table if not exists public.species_rules (
  species text primary key,
  -- Approximate bounding box for the approved harvesting belt.
  min_lat numeric not null,
  max_lat numeric not null,
  min_lng numeric not null,
  max_lng numeric not null,
  -- 1-12; if start > end the window wraps across the year boundary (e.g. 11–2 = Nov–Feb).
  harvest_month_start smallint not null check (harvest_month_start between 1 and 12),
  harvest_month_end smallint not null check (harvest_month_end between 1 and 12),
  max_moisture_pct numeric,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.species_rules enable row level security;

drop policy if exists species_rules_select_all on public.species_rules;
create policy species_rules_select_all
  on public.species_rules for select
  to authenticated, anon
  using (true);

-- No public insert/update/delete policy — rules are seeded by this script /
-- managed from the SQL editor, not editable from the app.

insert into public.species_rules (species, min_lat, max_lat, min_lng, max_lng, harvest_month_start, harvest_month_end, max_moisture_pct, notes)
values
  ('Ashwagandha', 24.0, 28.0, 73.0, 77.0, 1, 3, 8.0, 'Rajasthan belt (Nagaur/Pratapgarh) — India''s best-known Ashwagandha growing region. Roots are dug Jan–Mar after the plant dies back.'),
  ('Turmeric', 10.5, 11.5, 77.0, 78.2, 1, 3, 10.0, 'Erode, Tamil Nadu — the country''s largest turmeric trading belt. Harvested 7–9 months after planting, typically Jan–Mar.'),
  ('Amla (Indian Gooseberry)', 25.0, 26.5, 81.0, 82.5, 11, 2, 12.0, 'Pratapgarh, Uttar Pradesh — GI-tagged Amla belt. Fruit harvested Nov–Feb.'),
  ('Brahmi', 10.0, 11.5, 76.0, 77.2, 8, 11, 12.0, 'Kerala/Nilgiris wetlands, a common Brahmi collection region. Harvested post-monsoon, Aug–Nov.'),
  ('Tulsi (Holy Basil)', 21.0, 26.5, 74.0, 82.0, 10, 11, 10.0, 'Madhya Pradesh belt, illustrative — Tulsi is grown across most of India; this is one common commercial region, not the only valid one.')
on conflict (species) do update set
  min_lat = excluded.min_lat, max_lat = excluded.max_lat,
  min_lng = excluded.min_lng, max_lng = excluded.max_lng,
  harvest_month_start = excluded.harvest_month_start, harvest_month_end = excluded.harvest_month_end,
  max_moisture_pct = excluded.max_moisture_pct, notes = excluded.notes;

-- ── Enforcement trigger ─────────────────────────────────────────────────────
-- Geo-fence and seasonal checks apply only on INSERT (i.e. at the moment a
-- collection event is recorded) — never on UPDATE, so a later-stage edit
-- (processing notes, status change, etc.) on an existing batch is never
-- retroactively blocked by a rule that didn't exist when it was collected.
--
-- The moisture/quality gate applies on INSERT, and on UPDATE only when the
-- moisture value is actually being newly set or changed — so an unrelated
-- edit to an existing record is never blocked by a historical moisture
-- value that was never gated before this migration ran.
create or replace function public.enforce_species_collection_rules()
returns trigger
language plpgsql
as $$
declare
  rule public.species_rules%rowtype;
  gps text;
  lat numeric;
  lng numeric;
  harvest_month smallint;
  moisture numeric;
  moisture_changed boolean;
begin
  select * into rule from public.species_rules where species = (new.payload->>'species');
  if rule.species is null then
    return new; -- no rule configured for this species — pass through, same as today
  end if;

  if TG_OP = 'INSERT' then
    gps := new.payload->>'gpsLocation';
    if gps is not null and gps <> '' then
      begin
        lat := trim(split_part(gps, ',', 1))::numeric;
        lng := trim(split_part(gps, ',', 2))::numeric;
      exception when others then
        lat := null; lng := null; -- unparseable GPS text — not this trigger's job to reject bad formatting
      end;

      if lat is not null and lng is not null then
        if lat < rule.min_lat or lat > rule.max_lat or lng < rule.min_lng or lng > rule.max_lng then
          raise exception 'Geo-fence violation: this % collection at (%, %) falls outside the approved harvesting belt.', new.payload->>'species', lat, lng;
        end if;
      end if;
    end if;

    if new.payload->>'harvestDate' is not null and new.payload->>'harvestDate' <> '' then
      begin
        harvest_month := extract(month from (new.payload->>'harvestDate')::date);
      exception when others then
        harvest_month := null;
      end;

      if harvest_month is not null then
        if rule.harvest_month_start <= rule.harvest_month_end then
          if harvest_month < rule.harvest_month_start or harvest_month > rule.harvest_month_end then
            raise exception 'Seasonal restriction: % is only approved for harvest in months % to % — this record is dated month %.', new.payload->>'species', rule.harvest_month_start, rule.harvest_month_end, harvest_month;
          end if;
        else
          if harvest_month < rule.harvest_month_start and harvest_month > rule.harvest_month_end then
            raise exception 'Seasonal restriction: % is only approved for harvest in months % to % — this record is dated month %.', new.payload->>'species', rule.harvest_month_start, rule.harvest_month_end, harvest_month;
          end if;
        end if;
      end if;
    end if;
  end if;

  moisture_changed := TG_OP = 'INSERT' or (old.payload->>'moisture') is distinct from (new.payload->>'moisture');

  if rule.max_moisture_pct is not null and moisture_changed
     and new.payload->>'moisture' is not null and new.payload->>'moisture' <> '' then
    begin
      moisture := (new.payload->>'moisture')::numeric;
    exception when others then
      moisture := null;
    end;
    if moisture is not null and moisture > rule.max_moisture_pct then
      raise exception 'Quality gate failed: moisture % exceeds the approved max % for %.', moisture, rule.max_moisture_pct, new.payload->>'species';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists batches_enforce_species_rules on public.batches;
create trigger batches_enforce_species_rules
  before insert or update on public.batches
  for each row execute function public.enforce_species_collection_rules();

-- ── Verification ────────────────────────────────────────────────────────────
select species, min_lat, max_lat, min_lng, max_lng, harvest_month_start, harvest_month_end, max_moisture_pct
from public.species_rules
order by species;
