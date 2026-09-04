import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { subscribeToTable } from '../lib/realtimeSubscription';
import { mockBatches } from '../lib/mockData';
import type { Batch, BatchTimelineEvent } from '../types';

/**
 * Batches are persisted in Supabase (public.batches) so a batch created by a
 * Collection Centre is visible to Processing, Manufacturing, Supply Chain and
 * the Government portal — and survives a page reload.
 *
 * The public API (`batches`, `addBatch`, `updateBatchStatus`, `rejectBatch`) is
 * unchanged from the previous in-memory version, so every consuming screen keeps
 * working; the mutations now write through to the database.
 *
 * `mockBatches` are still shown alongside real rows as demo seed data, so the
 * role dashboards aren't empty before any real batch exists.
 *
 * Offline queue: a Collection Centre creating a batch over a poor rural
 * connection should not lose the record because the request never reached
 * Supabase. `addBatch` still shows the batch immediately either way; when the
 * write can't reach the network it's kept in `pendingSync` (persisted to
 * localStorage so it survives a reload or closed tab) and retried once
 * connectivity returns — automatically on the browser's `online` event, or
 * on demand via `syncPendingBatches`. A real rejection from the database
 * (geo-fence, season, quality-gate — see sql/*.sql) is not queued; only
 * requests that never reached the server are.
 */
interface BatchStore {
  batches: Batch[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  pendingSync: Batch[];
  syncing: boolean;

  loadBatches: () => Promise<void>;
  subscribe: () => () => void;

  addBatch: (batch: Batch) => Promise<void>;
  /** Merges arbitrary fields into a batch and persists them. */
  patchBatch: (id: string, patch: Partial<Batch>, event?: BatchTimelineEvent) => Promise<void>;
  updateBatchStatus: (id: string, status: Batch['status'], newEvent: BatchTimelineEvent) => Promise<void>;
  rejectBatch: (id: string, stage: string, reason: string) => Promise<void>;
  /** Retries every queued batch. Safe to call whether or not anything is pending. */
  syncPendingBatches: () => Promise<void>;
}

/** Demo seeds are identified so they're never written back to the database. */
const mockIds = new Set(mockBatches.map((b) => b.id));
const isMock = (id: string) => mockIds.has(id);

type Row = {
  id: string;
  payload: Batch;
  // Written by ayurtrace-fabric-relay, not by this app — see the field
  // comments on Batch (types/index.ts) and sql/add_blockchain_metadata.sql.
  blockchain_tx_id?: string | null;
  blockchain_status?: 'PENDING' | 'CONFIRMED' | 'FAILED' | null;
};

const rowToBatch = (row: Row): Batch => ({
  ...row.payload,
  id: row.id,
  blockchainTxId: row.blockchain_tx_id ?? undefined,
  blockchainStatus: row.blockchain_status ?? undefined,
});

const PENDING_SYNC_KEY = 'ayurtrace-pending-batches';

function loadPendingFromStorage(): Batch[] {
  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    return raw ? (JSON.parse(raw) as Batch[]) : [];
  } catch {
    return [];
  }
}

function savePendingToStorage(pending: Batch[]) {
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
  } catch {
    // Storage unavailable (private browsing, quota) — the queue still works
    // for the rest of this session, it just won't survive a reload.
  }
}

/** True when a write failed because it never reached the server — not
 *  because the server reached a verdict and rejected it. A real Postgres
 *  rejection (a trigger's `raise exception`) comes back with an error code;
 *  a network failure does not. */
function isConnectivityError(error: { message?: string; code?: string } | null): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  if (!error) return false;
  if (error.code) return false;
  return /fetch|network/i.test(error.message ?? '');
}

export const useBatchStore = create<BatchStore>((set, get) => ({
  batches: mockBatches,
  loading: false,
  error: null,
  loaded: false,
  pendingSync: loadPendingFromStorage(),
  syncing: false,

  loadBatches: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('batches')
      .select('id, payload, blockchain_tx_id, blockchain_status')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load batches:', error);
      // Keep the demo seeds (and anything queued offline) visible rather
      // than blanking the screen.
      set({ loading: false, error: error.message, loaded: true });
      return;
    }

    const real = (data as Row[]).map(rowToBatch);
    // Queued batches haven't reached the database yet, so they're not in
    // `real` — show them anyway, they were shown the moment they were created.
    const pending = get().pendingSync;
    set({
      batches: [...pending, ...real, ...mockBatches],
      loading: false,
      error: null,
      loaded: true,
    });
  },

  /** Live updates. The channel is shared, so several hooks may watch the same
   *  table without the second one throwing. */
  subscribe: () => subscribeToTable('batches', () => get().loadBatches()),

  addBatch: async (batch) => {
    // Show it straight away, then reconcile with the row the database returns.
    set((state) => ({ batches: [batch, ...state.batches] }));

    let data: Row | null = null;
    let error: { message?: string; code?: string } | null = null;
    try {
      const result = await supabase.from('batches').insert({ payload: batch }).select('id, payload, blockchain_tx_id, blockchain_status').single();
      data = result.data as Row | null;
      error = result.error;
    } catch (err) {
      // A fetch that never completed (offline, DNS, timeout) throws rather
      // than resolving with an `error` field, depending on the environment.
      error = { message: err instanceof Error ? err.message : 'Network request failed' };
    }

    if (error) {
      if (isConnectivityError(error)) {
        // Never reached the server — keep it queued, not failed. The batch
        // stays visible (it's already in `batches`) and will sync itself.
        set((state) => {
          const pendingSync = [batch, ...state.pendingSync];
          savePendingToStorage(pendingSync);
          return { pendingSync };
        });
        return;
      }
      console.error('Failed to save batch:', error);
      set({ error: error.message ?? 'Unknown error' });
      // Supabase/Postgrest errors are plain objects, not Error instances — a
      // caller doing `err instanceof Error` (CreateBatch.tsx's toast, for one)
      // would silently swallow the real reason (a geo-fence/season/quality-gate
      // rejection from the SQL triggers) and show a useless "unknown error".
      throw new Error(error.message ?? 'Unknown error');
    }

    const saved = rowToBatch(data as Row);
    set((state) => ({
      batches: state.batches.map((b) => (b.batchNumber === saved.batchNumber ? saved : b)),
      error: null,
    }));
  },

  patchBatch: async (id, patch, event) => {
    const current = get().batches.find((b) => b.id === id);
    if (!current) return;

    const next: Batch = {
      ...current,
      ...patch,
      timeline: event ? [event, ...current.timeline] : current.timeline,
    };

    set((state) => ({ batches: state.batches.map((b) => (b.id === id ? next : b)) }));

    if (isMock(id)) return; // demo seed — nothing to persist

    const { error } = await supabase
      .from('batches')
      .update({ payload: { ...next, id: undefined } })
      .eq('id', id);

    if (error) {
      console.error('Failed to patch batch:', error);
      set({ error: error.message });
      // See addBatch's identical fix — a Postgrest error is a plain object,
      // not an Error instance, so callers checking `instanceof Error` need a
      // real one or the SQL trigger's actual rejection reason gets hidden.
      throw new Error(error.message ?? 'Unknown error');
    }
  },

  updateBatchStatus: async (id, status, newEvent) => {
    const current = get().batches.find((b) => b.id === id);
    if (!current) return;

    const next: Batch = {
      ...current,
      status,
      currentStage: newEvent.stage,
      timeline: [newEvent, ...current.timeline],
    };

    set((state) => ({ batches: state.batches.map((b) => (b.id === id ? next : b)) }));

    if (isMock(id)) return; // demo seed — nothing to persist

    const { error } = await supabase
      .from('batches')
      .update({ payload: { ...next, id: undefined } })
      .eq('id', id);

    if (error) {
      console.error('Failed to update batch:', error);
      set({ error: error.message });
    }
  },

  rejectBatch: async (id, stage, reason) => {
    const current = get().batches.find((b) => b.id === id);
    if (!current) return;

    // `stage` arrives as a role label ("Processing & Laboratory", "Manufacturer"),
    // which is not one of the timeline's stage values — map it across, and keep
    // the original in `organization` so the rejecting party stays on the record.
    const stageMap: Record<string, BatchTimelineEvent['stage']> = {
      'Collection Center': 'Collection',
      'Processing & Laboratory': 'Laboratory',
      Processing: 'Processing',
      Manufacturer: 'Manufacturing',
      Manufacturing: 'Manufacturing',
      'Supply Chain': 'Supply Chain',
    };

    const event: BatchTimelineEvent = {
      stage: stageMap[stage] ?? 'Collection',
      timestamp: new Date().toISOString(),
      organization: stage,
      user: 'System User',
      status: 'Rejected',
      remarks: `Rejected: ${reason}`,
    };

    const next: Batch = {
      ...current,
      status: 'Rejected',
      currentStage: stage,
      timeline: [event, ...current.timeline],
    };

    set((state) => ({ batches: state.batches.map((b) => (b.id === id ? next : b)) }));

    if (isMock(id)) return;

    const { error } = await supabase
      .from('batches')
      .update({ payload: { ...next, id: undefined } })
      .eq('id', id);

    if (error) {
      console.error('Failed to reject batch:', error);
      set({ error: error.message });
    }
  },

  syncPendingBatches: async () => {
    const pending = get().pendingSync;
    if (!pending.length || get().syncing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    set({ syncing: true });
    const stillPending: Batch[] = [];

    for (const batch of pending) {
      try {
        const { data, error } = await supabase
          .from('batches')
          .insert({ payload: batch })
          .select('id, payload, blockchain_tx_id, blockchain_status')
          .single();

        if (error) {
          stillPending.push(batch); // still unreachable, or the same block recurs — keep it queued
          continue;
        }

        const saved = rowToBatch(data as Row);
        set((state) => ({
          batches: state.batches.map((b) => (b.id === batch.id ? saved : b)),
        }));
      } catch {
        stillPending.push(batch);
      }
    }

    savePendingToStorage(stillPending);
    set({ pendingSync: stillPending, syncing: false });
  },
}));

/**
 * Fetches batches on mount and keeps them live for as long as the screen is
 * shown. Safe to call from several screens at once — the fetch is guarded so
 * only the first mount hits the network.
 */
export function useBatchesLive() {
  const loading = useBatchStore((s) => s.loading);
  const error = useBatchStore((s) => s.error);

  useEffect(() => {
    const { loaded, loading: isLoading, loadBatches, subscribe, syncPendingBatches } = useBatchStore.getState();
    if (!loaded && !isLoading) void loadBatches();
    void syncPendingBatches();

    // A batch queued while offline retries itself the moment the browser
    // regains connectivity — no manual action needed, though one is offered too.
    window.addEventListener('online', syncPendingBatches);
    const unsubscribe = subscribe();
    return () => {
      window.removeEventListener('online', syncPendingBatches);
      unsubscribe();
    };
  }, []);

  return { loading, error };
}
