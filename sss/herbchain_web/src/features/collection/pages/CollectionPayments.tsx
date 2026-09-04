import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/PageHeader';
import BatchStatusBadge from '../../../components/BatchStatusBadge';
import StatsCard from '../../../components/StatsCard';
import DownloadReceiptButton from '../../../components/DownloadReceiptButton';
import RecordPaymentDialog from '../../../components/RecordPaymentDialog';
import { usePaymentStore, usePaymentsLive } from '../../../store/usePaymentStore';
import { CreditCard, TrendingUp, CheckCircle2, Plus } from 'lucide-react';

export default function CollectionPayments() {
  usePaymentsLive();
  const payments = usePaymentStore((s) => s.payments);
  const [recording, setRecording] = useState(false);

  const myPayments = payments.filter((p) => p.stage === 'Collection' || p.recipientRole === 'Collection Center');
  const released = myPayments.filter((p) => p.status === 'Released').reduce((s, p) => s + p.amount, 0);
  const pending = myPayments.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Payments"
        description="Record and track proof-of-sale payments to farmers and wild collectors"
        actions={
          <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white" onClick={() => setRecording(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Record Payment
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Released" value={`₹${released.toLocaleString('en-IN')}`} icon={CheckCircle2} iconColor="text-primary" iconBg="bg-primary/6 dark:bg-primary/14" />
        <StatsCard title="Pending Release" value={`₹${pending.toLocaleString('en-IN')}`} icon={TrendingUp} iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950/40" />
        <StatsCard title="Total Transactions" value={myPayments.length} icon={CreditCard} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950/40" />
      </div>

      {/* Payment stages visual */}
      <Card className="overflow-hidden">
        <CardHeader><CardTitle className="text-base">Payment Flow</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {['Collection Completed','↓','Payment Released','↓','Processing Completed','↓','Manufacturing','↓','Final Settlement'].map((step, i) => (
              step === '↓' ? (
                <div key={i} className="text-muted-foreground font-bold px-2 text-lg">→</div>
              ) : (
                <div key={i} className={`flex-1 min-w-32 p-3 rounded-lg text-center text-xs font-medium border shrink-0 ${i === 0 || i === 4 ? 'bg-primary/6 dark:bg-primary/12 border-primary/25 dark:border-primary/30 text-primary dark:text-primary' : 'bg-muted/50 border-border text-muted-foreground'}`}>
                  {step}
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Batch ID</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Released On</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Proof</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myPayments.map((p) => (
                <TableRow key={p.id} className="table-row-hover">
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.batchNumber || p.batchId}</TableCell>
                  <TableCell className="text-sm">{p.stage}</TableCell>
                  <TableCell className="text-sm font-bold text-primary dark:text-primary">₹{p.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell><BatchStatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.releasedAt ? new Date(p.releasedAt).toLocaleDateString('en-IN') : '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-40 truncate">{p.remarks || '—'}</TableCell>
                  <TableCell className="text-right"><DownloadReceiptButton payment={p} /></TableCell>
                </TableRow>
              ))}
              {myPayments.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">No payment records yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {recording && (
        <RecordPaymentDialog stage="Collection" defaultRecipientRole="Farmer" onClose={() => setRecording(false)} />
      )}
    </div>
  );
}
