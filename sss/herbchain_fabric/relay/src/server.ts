import express from 'express';
import { config } from './config';
import webhookRouter from './routes/webhook';
import provenanceRouter from './routes/provenance';
import { closeFabricConnection } from './fabricClient';

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'ayurtrace-fabric-relay' }));

app.use('/webhook', webhookRouter);
app.use('/api/blockchain', provenanceRouter);

app.listen(config.port, () => {
  console.log(`[relay] listening on :${config.port}`);
  console.log(`[relay] webhook endpoints: POST /webhook/{batches,products,payments}`);
  console.log(`[relay] read endpoints:    GET  /api/blockchain/{provenance/:batchId,verify/:productId,genealogy/:productId,transaction/:txId}`);
});

process.on('SIGINT', () => {
  closeFabricConnection();
  process.exit(0);
});
process.on('SIGTERM', () => {
  closeFabricConnection();
  process.exit(0);
});
