import { submitTransaction } from './fabricClient';
import { writeBlockchainMetadata, supabaseAdmin } from './supabaseWriter';
import { planBatchEvents, planProductEvents, WebhookPayload } from './routes/webhook';
import { config } from './config';

/**
 * One-off backfill for rows that existed in Supabase BEFORE the Database
 * Webhooks were ever configured — an INSERT webhook only fires on a row's
 * actual insert, so anything created earlier has no blockchain_status at all
 * and never will, on its own. This drives those rows through the exact same
 * planBatchEvents/planProductEvents logic the live webhook uses (imported,
 * not duplicated) so it's a real catch-up run, not a separate code path.
 *
 * Batches are processed fully before products, since CreateManufacturingEvent
 * references batch IDs that must already exist on-chain.
 *
 * Usage: npm run backfill
 */

async function processRow(table: 'batches' | 'products', row: { id: string; payload: any }) {
  const body: WebhookPayload = {
    type: 'INSERT',
    table,
    schema: 'public',
    record: { id: row.id, payload: row.payload },
    old_record: null,
  };
  const calls = table === 'batches' ? planBatchEvents(body) : planProductEvents(body);
  if (calls.length === 0) {
    console.log(`[backfill] ${table}.${row.id} — nothing to submit (e.g. a product with no linked batches yet)`);
    return;
  }

  let lastTxId: string | null = null;
  let assetId: string | null = null;

  for (const call of calls) {
    try {
      console.log(`[backfill] ${table}.${row.id} → ${call.label}`);
      const { txId } = await submitTransaction(call.fn, ...call.args);
      lastTxId = txId;
      assetId = call.args[1] ?? call.args[0];
      console.log(`[backfill]   committed: ${txId}`);
    } catch (err) {
      console.error(`[backfill] FAILED ${call.label} for ${table}.${row.id}:`, err instanceof Error ? err.message : err);
      await writeBlockchainMetadata(table, row.id, {
        blockchain_status: 'FAILED',
        blockchain_network: config.fabric.channelName,
      });
      return;
    }
  }

  if (lastTxId) {
    await writeBlockchainMetadata(table, row.id, {
      blockchain_tx_id: lastTxId,
      blockchain_status: 'CONFIRMED',
      blockchain_asset_id: assetId,
      blockchain_network: config.fabric.channelName,
    });
  }
}

async function backfillTable(table: 'batches' | 'products') {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('id, payload')
    .is('blockchain_status', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`[backfill] Could not read ${table}:`, error.message);
    return;
  }

  console.log(`[backfill] ${data.length} pending ${table} row(s)`);
  for (const row of data) {
    await processRow(table, row);
  }
}

async function main() {
  await backfillTable('batches');
  await backfillTable('products');
  console.log('[backfill] Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[backfill] Fatal:', err);
  process.exit(1);
});
