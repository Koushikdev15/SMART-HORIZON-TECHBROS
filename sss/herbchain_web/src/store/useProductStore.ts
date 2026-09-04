import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { subscribeToTable } from '../lib/realtimeSubscription';
import type { BatchTimelineEvent, Product } from '../types';

/**
 * Finished products, persisted in Supabase (public.products).
 *
 * Mirrors useBatchStore: a product created by a Manufacturer must be visible to
 * Supply Chain, the Government portal, and — via the printed QR — to the public
 * verification page, which reads this table anonymously.
 */
interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  loaded: boolean;

  loadProducts: () => Promise<void>;
  subscribe: () => () => void;

  addProduct: (product: Product) => Promise<Product>;
  patchProduct: (id: string, patch: Partial<Product>) => Promise<void>;
  /** Regulator action: pulls a released product from the market with an immediate,
   *  ledger-recorded consumer warning (surfaced next time /verify/:code is opened). */
  recallProduct: (id: string, reason: string, issuedBy: string) => Promise<void>;
}

type Row = {
  id: string;
  payload: Product;
  blockchain_tx_id?: string | null;
  blockchain_status?: 'PENDING' | 'CONFIRMED' | 'FAILED' | null;
};

const rowToProduct = (row: Row): Product => ({
  ...row.payload,
  id: row.id,
  blockchainTxId: row.blockchain_tx_id ?? undefined,
  blockchainStatus: row.blockchain_status ?? undefined,
});

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  loaded: false,

  loadProducts: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('products')
      .select('id, payload, blockchain_tx_id, blockchain_status')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load products:', error);
      set({ loading: false, error: error.message, loaded: true });
      return;
    }

    set({
      products: (data as Row[]).map(rowToProduct),
      loading: false,
      error: null,
      loaded: true,
    });
  },

  /** Live updates. The channel is shared, so several hooks may watch the same
   *  table without the second one throwing. */
  subscribe: () => subscribeToTable('products', () => get().loadProducts()),

  addProduct: async (product) => {
    const { data, error } = await supabase
      .from('products')
      .insert({ payload: product })
      .select('id, payload, blockchain_tx_id, blockchain_status')
      .single();

    if (error) {
      console.error('Failed to save product:', error);
      set({ error: error.message });
      // A Postgrest error is a plain object, not an Error instance — throw a
      // real one so callers checking `instanceof Error` see the actual reason.
      throw new Error(error.message ?? 'Unknown error');
    }

    const saved = rowToProduct(data as Row);
    set((state) => ({ products: [saved, ...state.products], error: null }));
    return saved;
  },

  patchProduct: async (id, patch) => {
    const current = get().products.find((p) => p.id === id);
    if (!current) return;

    const next: Product = { ...current, ...patch };
    set((state) => ({ products: state.products.map((p) => (p.id === id ? next : p)) }));

    const { error } = await supabase
      .from('products')
      .update({ payload: { ...next, id: undefined } })
      .eq('id', id);

    if (error) {
      console.error('Failed to patch product:', error);
      set({ error: error.message });
      // A Postgrest error is a plain object, not an Error instance — throw a
      // real one so callers checking `instanceof Error` see the actual reason.
      throw new Error(error.message ?? 'Unknown error');
    }
  },

  recallProduct: async (id, reason, issuedBy) => {
    const current = get().products.find((p) => p.id === id);
    if (!current) return;

    const event: BatchTimelineEvent = {
      stage: 'Supply Chain',
      timestamp: new Date().toISOString(),
      organization: 'Ministry of AYUSH — Government Portal',
      user: issuedBy,
      status: 'Rejected',
      remarks: `RECALLED: ${reason}`,
    };

    const next: Product = {
      ...current,
      status: 'Recalled',
      timeline: [event, ...current.timeline],
    };

    set((state) => ({ products: state.products.map((p) => (p.id === id ? next : p)) }));

    const { error } = await supabase
      .from('products')
      .update({ payload: { ...next, id: undefined } })
      .eq('id', id);

    if (error) {
      console.error('Failed to recall product:', error);
      set({ error: error.message });
      // A Postgrest error is a plain object, not an Error instance — throw a
      // real one so callers checking `instanceof Error` see the actual reason.
      throw new Error(error.message ?? 'Unknown error');
    }
  },
}));

/**
 * Fetches products on mount and keeps them live for as long as the screen is
 * shown. Safe to call from several screens at once — the fetch is guarded so
 * only the first mount hits the network.
 */
export function useProductsLive() {
  const loading = useProductStore((s) => s.loading);
  const error = useProductStore((s) => s.error);

  useEffect(() => {
    const { loaded, loading: isLoading, loadProducts, subscribe } = useProductStore.getState();
    if (!loaded && !isLoading) void loadProducts();
    return subscribe();
  }, []);

  return { loading, error };
}
