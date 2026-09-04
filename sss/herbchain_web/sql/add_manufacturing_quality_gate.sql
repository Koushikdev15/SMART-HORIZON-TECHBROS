-- ============================================================================
-- AyurTrace+ — real quality gate on the Laboratory → Manufacturing transition
--
-- WHERE: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Requires add_species_collection_rules.sql to have been run first (this
-- reads the same public.species_rules table).
--
-- Context: today, whether a batch moves to Manufacturing is decided entirely
-- by the lab analyst manually picking "Pass" / "Fail" / "Conditional Pass"
-- in ProcessingRequests.tsx (report.overallResult) — the actual moisture
-- value they typed in the same form is never independently checked against
-- anything. A batch with moisture at, say, 25% can still be forwarded if the
-- analyst clicks Pass. This adds a real, independent, database-level check
-- that can't be bypassed by that dropdown: if the batch's own recorded
-- moisture exceeds this species' approved threshold, the transition to
-- Manufacturing is rejected regardless of what the form says.
--
-- Same independence problem exists for two more fields on that form:
-- "DNA Authentication" and "Pesticide Residue" (ProcessingRequests.tsx,
-- TestField dropdowns, each Pass / Fail / Pending) are recorded but never
-- checked against overallResult — an analyst can mark DNA or pesticide as
-- Fail and still click Pass on the overall result, and the batch proceeds.
-- This trigger blocks that too: DNA = Fail or Pesticide = Fail on the batch
-- being saved hard-stops the Manufacturing transition, independent of
-- overallResult. (Pending is not blocked — a test not yet resulted is not a
-- failure; NMPB/pharmacopoeial ppm thresholds are not modelled because the
-- form captures a Pass/Fail verdict, not a numeric ppm reading.)
--
-- Scope: only fires at the moment status is *changing to* 'Manufacturing' —
-- never on a re-save of a batch already past that stage, so no existing
-- batch that already reached Manufacturing is retroactively affected.
--
-- Safe to re-run.
-- ============================================================================

create or replace function public.enforce_manufacturing_quality_gate()
returns trigger
language plpgsql
as $$
declare
  rule public.species_rules%rowtype;
  moisture numeric;
  entering_manufacturing boolean;
begin
  entering_manufacturing :=
    (new.payload->>'status') = 'Manufacturing'
    and (old.payload->>'status') is distinct from 'Manufacturing';

  if not entering_manufacturing then
    return new;
  end if;

  if new.payload->>'dnaAuthentication' = 'Fail' then
    raise exception 'Quality gate failed: DNA authentication is marked Fail for % — this batch cannot be forwarded to Manufacturing regardless of the lab''s overall result.', new.payload->>'species';
  end if;

  if new.payload->>'pesticides' = 'Fail' then
    raise exception 'Quality gate failed: pesticide residue is marked Fail for % — this batch cannot be forwarded to Manufacturing regardless of the lab''s overall result.', new.payload->>'species';
  end if;

  select * into rule from public.species_rules where species = (new.payload->>'species');
  if rule.species is null or rule.max_moisture_pct is null then
    return new; -- no configured threshold for this species — nothing to gate on
  end if;

  if new.payload->>'moisture' is not null and new.payload->>'moisture' <> '' then
    begin
      moisture := (new.payload->>'moisture')::numeric;
    exception when others then
      moisture := null;
    end;

    if moisture is not null and moisture > rule.max_moisture_pct then
      raise exception 'Quality gate failed: recorded moisture % exceeds the approved max % for % — this batch cannot be forwarded to Manufacturing regardless of the lab''s overall result.', moisture, rule.max_moisture_pct, new.payload->>'species';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists batches_manufacturing_quality_gate on public.batches;
create trigger batches_manufacturing_quality_gate
  before update on public.batches
  for each row execute function public.enforce_manufacturing_quality_gate();
