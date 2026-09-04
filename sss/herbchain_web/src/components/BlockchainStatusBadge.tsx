import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

/**
 * A small, reusable blockchain-status indicator — NOT a new dashboard, not a
 * redesign. Drops into an existing card/row next to whatever status pill is
 * already there (see ProductCatalogue.tsx's status badge for the pattern
 * this matches visually).
 *
 * Renders nothing when `status` is undefined — which is every row's actual
 * state today, since the ayurtrace-fabric-relay service and Fabric network
 * (herbchain_fabric/) aren't deployed yet. This component existing does not
 * mean blockchain is live; it means the UI is ready for the day it is,
 * without a second change to this file.
 */
export default function BlockchainStatusBadge({
  status,
  txId,
  className = '',
}: {
  status?: 'PENDING' | 'CONFIRMED' | 'FAILED';
  txId?: string;
  className?: string;
}) {
  if (!status) return null;

  const config = {
    PENDING: { icon: Clock, label: 'Blockchain Pending', tone: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' },
    CONFIRMED: { icon: CheckCircle2, label: 'Blockchain Confirmed', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
    FAILED: { icon: AlertTriangle, label: 'Blockchain Failed', tone: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' },
  }[status];

  const Icon = config.icon;

  return (
    <span
      title={txId ? `Fabric tx: ${txId}` : undefined}
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.tone} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
