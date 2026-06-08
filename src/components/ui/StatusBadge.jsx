const statusClasses = {
  Active: 'bg-mint/12 text-mint',
  Archived: 'bg-slate-300/10 text-slate-300 ring-1 ring-white/10',
  Closed: 'bg-slate-300/10 text-slate-300 ring-1 ring-white/10',
  Cancelled: 'bg-rose/12 text-rose ring-1 ring-rose/25',
  Success: 'bg-mint/12 text-mint',
  Pending: 'bg-gold/12 text-gold',
  Failed: 'bg-rose/12 text-rose',
  Refunded: 'bg-aqua/12 text-aqua',
  'Due Today': 'bg-mint/15 text-mint ring-1 ring-mint/25',
  Tomorrow: 'bg-gold/15 text-gold ring-1 ring-gold/25',
  Review: 'bg-gold/12 text-gold',
  Hold: 'bg-rose/12 text-rose',
  Performing: 'bg-mint/12 text-mint',
  Watchlist: 'bg-gold/12 text-gold',
  Overdue: 'bg-rose/12 text-rose',
  Paid: 'bg-mint/12 text-mint',
  Due: 'bg-aqua/12 text-aqua',
  Scheduled: 'bg-white/10 text-slate-300',
};

export default function StatusBadge({ status }) {
  const computedClass = status?.includes('Overdue')
    ? 'bg-rose/15 text-rose ring-1 ring-rose/25'
    : status?.includes('Days Left')
      ? 'bg-gold/15 text-gold ring-1 ring-gold/25'
      : statusClasses[status] || 'bg-white/10 text-slate-300';

  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-extrabold shadow-sm ${computedClass}`}>
      {status}
    </span>
  );
}
