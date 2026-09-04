import { Router } from 'express';
import { evaluateTransaction, getNetwork } from '../fabricClient';
import { config } from '../config';

/**
 * Read-only provenance endpoints — additive, per the brief's §21 suggestion:
 *   GET /api/blockchain/provenance/:batchId
 *   GET /api/blockchain/verify/:productCode
 *   GET /api/blockchain/transaction/:txId
 * These are meant to be called by herbchain_web/herbchain_app's EXISTING
 * batch-detail and product-verification pages as an *additional*, optional
 * fetch — none of them replace or change any existing Supabase-backed call.
 * No auth here yet: same trust level as the existing public
 * /verify/:code page and PublicController's /provenance/:batchId in
 * herbchain_backend, both of which are already unauthenticated by design
 * (a consumer scanning a box has no account). Add auth before exposing
 * anything beyond read-only provenance.
 */
const router = Router();

router.get('/provenance/:batchId', async (req, res) => {
  try {
    const result = await evaluateTransaction('GetProvenance', req.params.batchId);
    res.json({ batchId: req.params.batchId, events: JSON.parse(result) });
  } catch (err) {
    res.status(502).json({ error: 'Could not reach Fabric.', detail: (err as Error).message });
  }
});

router.get('/genealogy/:productId', async (req, res) => {
  try {
    const result = await evaluateTransaction('GetProductGenealogy', req.params.productId);
    res.json(JSON.parse(result));
  } catch (err) {
    res.status(502).json({ error: 'Could not reach Fabric.', detail: (err as Error).message });
  }
});

router.get('/verify/:productId', async (req, res) => {
  try {
    const result = await evaluateTransaction('VerifyProduct', req.params.productId);
    res.json(JSON.parse(result));
  } catch (err) {
    res.status(502).json({ error: 'Could not reach Fabric.', detail: (err as Error).message });
  }
});

/** Looks a transaction up on-chain by its real Fabric tx ID, via the `qscc`
 *  system chaincode — a standard part of every Fabric peer, not something we
 *  wrote. Used for the "view raw transaction" details panel — the brief's
 *  §17: "technical blockchain information only in an optional details
 *  section." Returns qscc's raw protobuf-JSON `ProcessedTransaction`. */
router.get('/transaction/:txId', async (req, res) => {
  try {
    const network = await getNetwork();
    const qscc = network.getContract('qscc');
    const result = await qscc.evaluateTransaction(
      'GetTransactionByID',
      config.fabric.channelName,
      req.params.txId,
    );
    res.json({ txId: req.params.txId, raw: Buffer.from(result).toString('base64') });
  } catch (err) {
    res.status(502).json({ error: 'Could not reach Fabric.', detail: (err as Error).message });
  }
});

export default router;
