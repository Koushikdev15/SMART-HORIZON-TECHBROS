import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useBatchStore } from '../store/useBatchStore';
import { WifiOff, RefreshCw, CloudUpload } from 'lucide-react';

/**
 * Visible offline-queue indicator for the Collection Centre form.
 *
 * A batch created without a working connection — the realistic case for a
 * rural collector — is never lost: `useBatchStore.addBatch` queues it to
 * localStorage instead of throwing, and this banner surfaces that queue so
 * the collector can see (and, if they want, force) the sync rather than
 * wondering whether the record went anywhere. It renders nothing once
 * nothing is queued and the browser is online.
 */
export default function OfflineSyncStatus() {
  const pendingSync = useBatchStore((s) => s.pendingSync);
  const syncing = useBatchStore((s) => s.syncing);
  const syncPendingBatches = useBatchStore((s) => s.syncPendingBatches);
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleSyncNow = async () => {
    if (!online) {
      toast.error('Still offline — will sync automatically once you have a connection.');
      return;
    }
    await syncPendingBatches();
    if (useBatchStore.getState().pendingSync.length === 0) {
      toast.success('All queued batches synced.');
    }
  };

  if (online && pendingSync.length === 0) return null;

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs ${
        online
          ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300'
          : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300'
      }`}
    >
      {online ? (
        <CloudUpload className="w-4 h-4 shrink-0" />
      ) : (
        <WifiOff className="w-4 h-4 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold">
          {online
            ? syncing
              ? 'Syncing queued batches…'
              : `${pendingSync.length} batch${pendingSync.length === 1 ? '' : 'es'} waiting to sync`
            : 'No connection — new batches are saved on this device'}
        </p>
        <p className="opacity-80 mt-0.5">
          {online
            ? 'Saved on this device while offline; sending to the ledger now.'
            : pendingSync.length > 0
              ? `${pendingSync.length} queued so far — they'll upload automatically the moment you're back online.`
              : "You can keep recording collections; nothing is lost. They'll upload automatically once you're back online."}
        </p>
      </div>
      {online && pendingSync.length > 0 && (
        <Button size="sm" variant="outline" className="h-7 text-[11px] shrink-0" disabled={syncing} onClick={handleSyncNow}>
          <RefreshCw className={`w-3 h-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
          Sync Now
        </Button>
      )}
    </div>
  );
}
