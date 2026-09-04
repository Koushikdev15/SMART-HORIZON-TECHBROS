import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { subscribeToTable } from '../lib/realtimeSubscription';
import { mockPayments } from '../lib/mockData';
import type { Payment } from '../types';

/**
 * Payments, persisted in Supabase (public.payments).
 *
 * Mirrors useBatchStore / useProductStore: a payment recorded by any role
 * must be visible to every other role's Payments screen and to the receipt
 * PDF generator — and survive a page reload. `mockPayments` are still shown
 * alongside real rows as demo seed data, same as mockBatches.
 */
interface PaymentStore {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  loaded: boolean;

  loadPayments: () => Promise<void>;
  subscribe: () => () => void;

  recordPayment: (payment: Payment) => Promise<void>;
  updatePaymentStatus: (id: string, status: Payment['status']) => Promise<void>;
}

const mockIds = new Set(mockPayments.map((p) => p.id));
const isMock = (id: string) => mockIds.has(id);

type Row = { id: string; payload: Payment };

const rowToPayment = (row: Row): Payment => ({ ...row.payload, id: row.id });

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: mockPayments,
  loading: false,
  error: null,
  loaded: false,

  loadPayments: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('payments')
      .select('id, payload')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load payments:', error);
      set({ loading: false, error: error.message, loaded: true });
      return;
    }

    const real = (data as Row[]).map(rowToPayment);
    set({ payments: [...real, ...mockPayments], loading: false, error: null, loaded: true });
  },

  subscribe: () => subscribeToTable('payments', () => get().loadPayments()),

  recordPayment: async (payment) => {
    set((state) => ({ payments: [payment, ...state.payments] }));

    const { data, error } = await supabase
      .from('payments')
      .insert({ payload: payment })
      .select('id, payload')
      .single();

    if (error) {
      console.error('Failed to record payment:', error);
      set({ error: error.message });
      // A Postgrest error is a plain object, not an Error instance — throw a
      // real one so callers checking `instanceof Error` see the actual reason.
      throw new Error(error.message ?? 'Unknown error');
    }

    const saved = rowToPayment(data as Row);
    set((state) => ({
      payments: state.payments.map((p) => (p.id === payment.id ? saved : p)),
      error: null,
    }));
  },

  updatePaymentStatus: async (id, status) => {
    const current = get().payments.find((p) => p.id === id);
    if (!current) return;

    const next: Payment = {
      ...current,
      status,
      releasedAt: status === 'Released' ? new Date().toISOString() : current.releasedAt,
    };

    set((state) => ({ payments: state.payments.map((p) => (p.id === id ? next : p)) }));

    if (isMock(id)) return;

    const { error } = await supabase
      .from('payments')
      .update({ payload: { ...next, id: undefined } })
      .eq('id', id);

    if (error) {
      console.error('Failed to update payment:', error);
      set({ error: error.message });
    }
  },
}));

export function usePaymentsLive() {
  const loading = usePaymentStore((s) => s.loading);
  const error = usePaymentStore((s) => s.error);

  useEffect(() => {
    const { loaded, loading: isLoading, loadPayments, subscribe } = usePaymentStore.getState();
    if (!loaded && !isLoading) void loadPayments();
    return subscribe();
  }, []);

  return { loading, error };
}
