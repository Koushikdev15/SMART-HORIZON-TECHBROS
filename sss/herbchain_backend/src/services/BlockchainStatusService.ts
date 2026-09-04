import { supabaseAdmin } from '../lib/supabaseAdmin';

/**
 * Real blockchain confirmation status for a product — read live from
 * Supabase's public.products table (blockchain_tx_id/blockchain_status,
 * written by herbchain_fabric/relay after an actual Fabric commit; see
 * herbchain_web/sql/add_blockchain_metadata.sql). Supabase is the source of
 * truth for this, not Mongo — this service never invents or caches a status,
 * it reflects whatever is really there right now.
 */
export interface BlockchainStatusResult {
  verified: boolean;
  network?: string;
  transactionId?: string;
  transactionRef?: string;
  timestamp?: string;
}

export class BlockchainStatusService {
  async getByProductName(productName: string): Promise<BlockchainStatusResult> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, blockchain_tx_id, blockchain_status, blockchain_network, updated_at')
      .filter('payload->>productName', 'ilike', productName)
      .limit(1)
      .maybeSingle();

    if (error || !data || data.blockchain_status !== 'CONFIRMED') {
      return { verified: false };
    }

    return {
      verified: true,
      network: data.blockchain_network ?? undefined,
      transactionId: data.blockchain_tx_id ?? undefined,
      transactionRef: data.id,
      timestamp: data.updated_at ?? undefined,
    };
  }
}
