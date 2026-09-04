import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rcsayomijvykveqvarsq.supabase.co',
  'sb_publishable_t7krAPz7m-utnTZN0y4z_g_VvSszo2U',
);

const { data: batches, error: bErr } = await supabase
  .from('batches')
  .select('id, payload, created_at, updated_at')
  .eq('batch_number', 'BATCH-2026-9016');

if (bErr) console.error('BATCH QUERY ERROR:', bErr);
else {
  console.log('batches found:', batches.length);
  for (const b of batches) {
    console.log('created_at:', b.created_at, '| updated_at:', b.updated_at);
    console.log('labReport:', JSON.stringify(b.payload.labReport, null, 2));
  }
}

const { data: members, error: mErr } = await supabase
  .from('members')
  .select('*')
  .or('name.ilike.%PureHerb%,"organizationName".ilike.%PureHerb%');

if (mErr) console.error('MEMBER QUERY ERROR:', mErr);
else {
  console.log('\nPureHerb members found:', members.length);
  for (const m of members) console.log(JSON.stringify(m, null, 2));
}
