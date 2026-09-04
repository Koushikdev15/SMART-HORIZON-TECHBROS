import { Router, Request, Response } from 'express';
import { submitTransaction } from '../fabricClient';
import { writeBlockchainMetadata } from '../supabaseWriter';
import { config } from '../config';

/**
 * Supabase Database Webhook payload shape (INSERT/UPDATE, batches/products/
 * payments — configured in the Supabase Dashboard, not in SQL; see
 * add_blockchain_metadata.sql's comment block).
 *
 * `record`/`old_record` are the FULL table row, including the app's own
 * `payload` jsonb column — so a batch's species lives at `record.payload.species`,
 * not `record.species`.
 */
export interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: Record<string, any>;
  old_record: Record<string, any> | null;
}

export interface ChaincodeCall {
  fn: string;
  args: string[];
  label: string; // for logging only
}

const router = Router();

router.use((req: Request, res: Response, next) => {
  if (req.header('x-webhook-secret') !== config.webhookSharedSecret) {
    res.status(401).json({ error: 'Missing or invalid webhook secret.' });
    return;
  }
  next();
});

router.post('/batches', (req, res) => handleWebhook(req, res, 'batches', planBatchEvents));
router.post('/products', (req, res) => handleWebhook(req, res, 'products', planProductEvents));
router.post('/payments', (req, res) => handleWebhook(req, res, 'payments', () => []));

async function handleWebhook(
  req: Request,
  res: Response,
  table: 'batches' | 'products' | 'payments',
  plan: (body: WebhookPayload) => ChaincodeCall[],
) {
  // Acknowledge immediately — Supabase's webhook delivery has its own
  // timeout, and endorsement + ordering can take a few seconds on a PoC
  // network. The actual blockchain_status update happens asynchronously and
  // is what the UI polls/reads, not this HTTP response.
  res.status(202).json({ accepted: true });

  const body = req.body as WebhookPayload;
  if (body.type === 'DELETE' || !body.record?.id) return;

  const calls = plan(body);
  if (calls.length === 0) return;

  let lastTxId: string | null = null;
  let assetId: string | null = null;

  for (const call of calls) {
    try {
      console.log(`[relay] ${table}.${body.record.id} → ${call.label}`);
      const { txId } = await submitTransaction(call.fn, ...call.args);
      lastTxId = txId;
      assetId = call.args[1] ?? call.args[0]; // batchId/productId is always the 2nd arg after eventId
    } catch (err) {
      console.error(`[relay] FAILED ${call.label} for ${table}.${body.record.id}:`, err);
      await writeBlockchainMetadata(table, body.record.id, {
        blockchain_status: 'FAILED',
        blockchain_network: config.fabric.channelName,
      });
      return; // stop the chain of calls — a later event depending on an
      // earlier one (e.g. AddQualityTest before ApproveBatch) shouldn't fire
      // against a batch that was never actually recorded as collected.
    }
  }

  if (lastTxId) {
    await writeBlockchainMetadata(table, body.record.id, {
      blockchain_tx_id: lastTxId,
      blockchain_status: 'CONFIRMED',
      blockchain_asset_id: assetId,
      blockchain_network: config.fabric.channelName,
    });
  }
}

// ── Event planning: map an app-level write to chaincode calls ──────────────
// Each function is pure and side-effect-free (easy to unit test later) — it
// only decides WHAT to call, handleWebhook is the only place that actually
// calls it.

export function planBatchEvents(body: WebhookPayload): ChaincodeCall[] {
  const id = body.record.id as string;
  const p = body.record.payload ?? {};
  const oldP = body.old_record?.payload ?? {};
  const calls: ChaincodeCall[] = [];

  if (body.type === 'INSERT') {
    const [lat, lng] = String(p.gpsLocation ?? '').split(',').map((s: string) => s.trim());
    calls.push({
      fn: 'CreateCollectionEvent',
      label: 'CreateCollectionEvent',
      args: [
        `COL-${id}`, id, p.species ?? '', String(p.quantity ?? 0), p.unit ?? '',
        p.collectorName ?? '', p.collectorType ?? '', lat ?? '0', lng ?? '0',
        p.region ?? '', p.harvestDate ?? '',
      ],
    });
    calls.push({
      fn: 'CreateBatch',
      label: 'CreateBatch',
      args: [`BATCH-${id}`, id, p.batchNumber ?? '', p.species ?? '', String(p.quantity ?? 0), p.unit ?? '', p.collectionCenter ?? ''],
    });
    return calls;
  }

  // UPDATE — diff against old_record to find out what actually changed.
  const labReportAdded = !oldP.labReport && p.labReport;
  if (labReportAdded) {
    const r = p.labReport;
    calls.push({
      fn: 'AddQualityTest',
      label: 'AddQualityTest',
      args: [
        `QT-${id}-${Date.now()}`, id, String(r.moisture ?? ''), r.dnaAuthentication ?? '',
        r.pesticides ?? '', r.overallResult ?? '', r.labName ?? '', r.labLicenseNumber ?? '', r.certificateNumber ?? '',
      ],
    });
    calls.push({
      fn: 'AddProcessingStep',
      label: 'AddProcessingStep',
      args: [
        `PROC-${id}-${Date.now()}`, id, r.dryingMethod ?? '', r.grindingMethod ?? '',
        r.storageCondition ?? '', r.outputQuantity ?? '', r.yieldPercent ?? '',
      ],
    });
  }

  if (oldP.status !== 'Rejected' && p.status === 'Rejected') {
    const rejectEvent = (p.timeline ?? []).find((e: any) => e.status === 'Rejected');
    calls.push({
      fn: 'RejectBatch',
      label: 'RejectBatch',
      args: [`REJ-${id}-${Date.now()}`, id, rejectEvent?.remarks ?? 'Rejected', rejectEvent?.user ?? 'unknown'],
    });
  } else if (oldP.status !== 'Manufacturing' && p.status === 'Manufacturing') {
    calls.push({
      fn: 'ApproveBatch',
      label: 'ApproveBatch',
      args: [`APR-${id}-${Date.now()}`, id, p.labReport?.approvedBy ?? p.labReport?.analyst ?? 'unknown'],
    });
  }

  if (!oldP.manufacturerCheckIn && p.manufacturerCheckIn) {
    calls.push({
      fn: 'TransferBatch',
      label: 'TransferBatch',
      args: [`XFER-${id}-${Date.now()}`, id, 'LaboratoryOrgMSP', 'ManufacturerOrgMSP', 'Manufacturing'],
    });
  }

  return calls;
}

export function planProductEvents(body: WebhookPayload): ChaincodeCall[] {
  const id = body.record.id as string;
  const p = body.record.payload ?? {};
  const oldP = body.old_record?.payload ?? {};
  const calls: ChaincodeCall[] = [];

  if (body.type === 'INSERT') {
    const batchIds = (p.components ?? []).map((c: any) => c.batchId).filter(Boolean);
    if (batchIds.length > 0) {
      calls.push({
        fn: 'CreateManufacturingEvent',
        label: 'CreateManufacturingEvent',
        args: [`MFG-${id}`, id, p.productCode ?? '', p.productName ?? '', p.manufacturerName ?? '', JSON.stringify(batchIds), p.batchSize ?? ''],
      });
    }
    return calls;
  }

  if (oldP.status !== 'Recalled' && p.status === 'Recalled') {
    const recallEvent = (p.timeline ?? []).find((e: any) => (e.remarks ?? '').startsWith('RECALLED'));
    calls.push({
      fn: 'RecallBatch',
      label: 'RecallBatch',
      args: [`RECALL-${id}-${Date.now()}`, id, recallEvent?.remarks ?? 'Recalled', recallEvent?.user ?? 'unknown'],
    });
  }

  if (!oldP.distribution && p.distribution) {
    calls.push({
      fn: 'CreateShipment',
      label: 'CreateShipment',
      args: [
        `SHIP-${id}-${Date.now()}`, id, id,
        p.distribution.warehouse ?? '', p.distribution.destination ?? '', p.distribution.deliveryStatus ?? '',
      ],
    });
  }

  return calls;
}

export default router;
