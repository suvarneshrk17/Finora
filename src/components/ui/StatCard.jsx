import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { compactCurrency } from '../../utils/formatters.js';

const toneMap = {
  mint: 'text-mint bg-mint/12',
  aqua: 'text-aqua bg-aqua/12',
  gold: 'text-gold bg-gold/12',
  rose: 'text-rose bg-rose/12',
};

const barMap = {
  mint: 'bg-mint',
  aqua: 'bg-aqua',
  gold: 'bg-gold',
  rose: 'bg-rose',
};

export default function StatCard({ card, index }) {
  const isMoney = ['Collected Amount', 'Pending Collection', 'Total Collected', 'Monthly Income'].includes(card.label);
  const max = Math.max(...card.spark);

  return (
    <motion.article
      className="glass-panel rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{card.label}</p>
          <p className="mt-3 text-2xl font-bold tracking-normal text-white">
            {isMoney ? compactCurrency(card.value) : card.value.toLocaleString('en-IN')}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${toneMap[card.tone]}`}>
          <ArrowUpRight className="h-3.5 w-3.5" />
          {card.change}
        </span>
      </div>
      <div className="mt-5 flex h-12 items-end gap-1.5">
        {card.spark.map((value, sparkIndex) => (
          <motion.span
            key={`${card.label}-${sparkIndex}`}
            className={`w-full rounded-t-sm ${barMap[card.tone]}`}
            initial={{ height: 4 }}
            animate={{ height: `${Math.max(18, (value / max) * 48)}px` }}
            transition={{ delay: 0.12 + sparkIndex * 0.04, duration: 0.35 }}
          />
        ))}
      </div>
    </motion.article>
  );
}
