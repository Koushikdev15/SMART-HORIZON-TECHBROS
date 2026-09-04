import { supabaseAdmin } from '../lib/supabaseAdmin';

/**
 * Real product traceability lookup by product code — the same query
 * herbchain_web's public /verify/:code page runs against Supabase directly
 * (see ProductVerification.tsx), exposed here so the mobile app's QR
 * scanner and manual "Batch ID" entry can fetch and render the same real
 * data natively instead of redirecting to the web page or falling back to
 * demo content.
 */
export class TraceService {
  async getByProductCode(code: string) {
    const { data: rows, error } = await supabaseAdmin
      .from('products')
      .select('id, payload, blockchain_tx_id, blockchain_status, blockchain_network')
      .ilike('product_code', code);

    if (error || !rows?.length) {
      return { found: false as const };
    }

    const row = rows[0];
    const product = {
      ...row.payload,
      id: row.id,
      blockchainTxId: row.blockchain_tx_id ?? undefined,
      blockchainStatus: row.blockchain_status ?? undefined,
      blockchainNetwork: row.blockchain_network ?? undefined,
    };

    const batchIds: string[] = (row.payload?.components ?? []).map((c: any) => c.batchId).filter(Boolean);

    let batches: any[] = [];
    let payments: any[] = [];

    if (batchIds.length) {
      const [batchesRes, paymentsRes] = await Promise.all([
        supabaseAdmin
          .from('batches')
          .select('id, payload, blockchain_tx_id, blockchain_status, blockchain_network')
          .in('id', batchIds),
        supabaseAdmin.from('payments').select('id, payload').in('batch_id', batchIds),
      ]);

      batches = (batchesRes.data ?? []).map((r) => ({
        ...r.payload,
        id: r.id,
        blockchainTxId: r.blockchain_tx_id ?? undefined,
        blockchainStatus: r.blockchain_status ?? undefined,
        blockchainNetwork: r.blockchain_network ?? undefined,
      }));
      payments = (paymentsRes.data ?? []).map((r) => ({ ...r.payload, id: r.id }));
    }

    return { found: true as const, product, batches, payments };
  }
}
