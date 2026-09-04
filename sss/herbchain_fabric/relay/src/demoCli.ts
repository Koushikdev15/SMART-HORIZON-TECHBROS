import { getContract, closeFabricConnection } from './fabricClient';

/**
 * Live-demo CLI — narrates a real CreateCollectionEvent + CreateBatch pair
 * for judges to watch in a terminal. Every value printed (event id, tx id,
 * commit status) comes from an actual endorsed-and-committed Fabric
 * transaction; nothing here is simulated text. This exists alongside the
 * relay's webhook path as a way to demo the chain directly, without needing
 * the Supabase webhook / public tunnel in the loop at all.
 *
 * Usage: npm run demo -- <batchId> [species] [quantity] [unit] [collectorName]
 */

function arg(i: number, fallback: string): string {
  return process.argv[i + 2] ?? fallback;
}

async function main() {
  const batchId = arg(0, `ASH-${Date.now().toString(36).toUpperCase()}`);
  const species = arg(1, 'Ashwagandha');
  const quantity = arg(2, '25');
  const unit = arg(3, 'kg');
  const collectorName = arg(4, 'Ravi Kumar');
  const collectorType = arg(5, 'Farmer');
  const lat = arg(6, '11.0168');
  const lng = arg(7, '76.9558');
  const region = arg(8, 'Coimbatore, Tamil Nadu');
  const harvestDate = arg(9, new Date().toISOString().slice(0, 10));

  const eventId = `COL-${batchId}`;
  const batchLabel = `BATCH-${batchId}`;

  console.log('Creating collection event...\n');
  console.log(`Event ID:\n${eventId}\n`);
  console.log(`Batch:\n${batchLabel}\n`);

  const contract = await getContract();

  console.log('Submitting transaction to Fabric...\n');
  const collectionProposal = contract.newProposal('CreateCollectionEvent', {
    arguments: [eventId, batchId, species, quantity, unit, collectorName, collectorType, lat, lng, region, harvestDate],
  });
  const collectionTx = await collectionProposal.endorse();
  console.log(`Transaction submitted:\n${collectionTx.getTransactionId()}\n`);

  console.log('Waiting for commit...\n');
  const collectionCommit = await collectionTx.submit();
  const collectionStatus = await collectionCommit.getStatus();
  console.log(collectionStatus ? 'Transaction committed successfully.' : 'Transaction failed to commit.');
  console.log(`Status: ${collectionStatus ? 'VALID' : 'INVALID'}\n`);

  console.log('----------------------------------------\n');
  console.log('Creating batch record...\n');
  const batchProposal = contract.newProposal('CreateBatch', {
    arguments: [batchLabel, batchId, batchId, species, quantity, unit, region],
  });
  const batchTx = await batchProposal.endorse();
  console.log(`Transaction submitted:\n${batchTx.getTransactionId()}\n`);

  console.log('Waiting for commit...\n');
  const batchCommit = await batchTx.submit();
  const batchStatus = await batchCommit.getStatus();
  console.log(batchStatus ? 'Transaction committed successfully.' : 'Transaction failed to commit.');
  console.log(`Status: ${batchStatus ? 'VALID' : 'INVALID'}\n`);

  console.log('----------------------------------------\n');
  console.log(`Fetching provenance for ${batchId} from the ledger...\n`);
  const provenance = await contract.evaluateTransaction('GetProvenance', batchId);
  console.log(JSON.stringify(JSON.parse(Buffer.from(provenance).toString('utf8')), null, 2));

  closeFabricConnection();
}

main().catch((err) => {
  console.error('\nFailed:', err instanceof Error ? err.message : err);
  closeFabricConnection();
  process.exit(1);
});
