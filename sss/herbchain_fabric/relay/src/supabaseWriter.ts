import { createClient } from '@supabase/supabase-js';
import { config } from './config';

/**
 * Service-role client — bypasses RLS, server-side only (see .env.example).
 * This is the ONLY thing in the whole AyurTrace+ system allowed to set
 * blockchain_status = 'CONFIRMED', and only after a real Fabric commit
 * actually returned that status (see webhook.ts).
 */
export const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export type BlockchainStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export async function writeBlockchainMetadata(
  table: 'batches' | 'products' | 'payments',
  rowId: string,
  fields: {
    blockchain_tx_id?: string | null;
    blockchain_status: BlockchainStatus;
    blockchain_asset_id?: string | null;
    blockchain_network?: string | null;
  },
): Promise<void> {
  const { error } = await supabaseAdmin.from(table).update(fields).eq('id', rowId);
  if (error) {
    // Logged, not thrown — a failure to record the *status* of a blockchain
    // failure must not itself crash the webhook handler. The row simply
    // keeps whatever blockchain_status it already had (NULL, most likely),
    // which the UI already renders as "not yet on-chain" rather than a lie.
    console.error(`Failed to write blockchain metadata onto ${table}.${rowId}:`, error.message);
  }
}
