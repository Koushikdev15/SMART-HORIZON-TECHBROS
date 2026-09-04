import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Payment } from '../types';
import { Download, Loader2 } from 'lucide-react';

/** Downloads the vector PDF receipt for one payment. Shared by every role's
 *  Payments screen and the consumer-facing batch/product trace view. */
export default function DownloadReceiptButton({
  payment,
  size = 'sm',
  variant = 'outline',
  className = 'h-7 text-[11px] px-2.5',
  label = 'Receipt',
}: {
  payment: Payment;
  size?: 'sm' | 'default' | 'icon';
  variant?: 'outline' | 'ghost' | 'default';
  className?: string;
  label?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleClick = async () => {
    setDownloading(true);
    try {
      const { generateReceiptPdf } = await import('../lib/receiptPdf');
      await generateReceiptPdf(payment);
    } catch (err) {
      console.error('Receipt generation failed:', err);
      toast.error('Could not generate the receipt.');
    } finally {
      setDownloading(false);
    }
  };

  const iconClass = `w-3 h-3 ${label ? 'mr-1' : ''}`;

  return (
    <Button type="button" size={size} variant={variant} className={className} disabled={downloading} onClick={handleClick} title="Download receipt (PDF)">
      {downloading ? <Loader2 className={`${iconClass} animate-spin`} /> : <Download className={iconClass} />}
      {label}
    </Button>
  );
}
