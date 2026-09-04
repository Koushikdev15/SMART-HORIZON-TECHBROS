import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TextField, SelectField } from './FormFields';
import { usePaymentStore } from '../store/usePaymentStore';
import { useBatchStore, useBatchesLive } from '../store/useBatchStore';
import { useAuthStore } from '../store/authStore';
import type { Payment, UserRole } from '../types';
import { Loader2, IndianRupee } from 'lucide-react';

const METHODS = ['Bank Transfer', 'UPI', 'Cash', 'Cheque'] as const;
const ROLES: UserRole[] = ['Farmer', 'Wild Collector', 'Collection Center', 'Processing & Laboratory', 'Manufacturer', 'Supply Chain'];

/**
 * Records a real Payment row against a real batch — the missing half of every
 * role's Payments screen, which until now could only display a fixed mock
 * array and never actually create a transaction. Reused across every stage's
 * page; `stage` fixes which leg of the supply chain this payment belongs to.
 */
export default function RecordPaymentDialog({
  stage,
  defaultRecipientRole,
  onClose,
}: {
  stage: Payment['stage'];
  defaultRecipientRole?: UserRole;
  onClose: () => void;
}) {
  useBatchesLive();
  const batches = useBatchStore((s) => s.batches);
  const recordPayment = usePaymentStore((s) => s.recordPayment);
  const user = useAuthStore((s) => s.user);
  const [submitting, setSubmitting] = useState(false);

  const [batchNumber, setBatchNumber] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientRole, setRecipientRole] = useState<string>(defaultRecipientRole ?? '');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string>('Bank Transfer');
  const [remarks, setRemarks] = useState('');

  const selectedBatch = batches.find((b) => b.batchNumber === batchNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber || !recipient || !recipientRole || !amount) {
      toast.error('Batch, recipient, role and amount are all required.');
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }

    setSubmitting(true);
    const now = new Date().toISOString();
    const payment: Payment = {
      id: `PAY-${Date.now()}`,
      batchId: selectedBatch?.id ?? batchNumber,
      batchNumber,
      species: selectedBatch?.species,
      stage,
      amount: numericAmount,
      currency: 'INR',
      status: 'Released',
      recipient,
      recipientRole: recipientRole as UserRole,
      payerName: user?.organizationName || user?.name,
      payerRole: user?.role,
      method: method as Payment['method'],
      releasedAt: now,
      createdAt: now,
      blockchainTxId: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      remarks: remarks || undefined,
    };

    try {
      await recordPayment(payment);
      toast.success(`Payment ${payment.id} recorded and released to ${recipient}.`);
      onClose();
    } catch {
      toast.error('Could not record the payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" /> Record Payment — {stage}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Batch<span className="text-red-500">*</span></label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              required
            >
              <option value="">Select a batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.batchNumber}>{b.batchNumber} — {b.species}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Recipient Name" value={recipient} onChange={setRecipient} placeholder="Who is being paid" required />
            <SelectField label="Recipient Role" value={recipientRole} onChange={setRecipientRole} options={ROLES} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Amount (₹)<span className="text-red-500">*</span></label>
              <Input type="number" min="0" step="0.01" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <SelectField label="Method" value={method} onChange={setMethod} options={METHODS} />
          </div>
          <TextField label="Remarks" value={remarks} onChange={setRemarks} placeholder="e.g. 40 kg @ ₹75/kg" />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <IndianRupee className="w-4 h-4 mr-1.5" />}
              Record & Release
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
