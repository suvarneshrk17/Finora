import { FileSearch } from 'lucide-react';

export default function EmptyState({ title = 'No records found', description }) {
  return (
    <div className="glass-panel grid min-h-56 place-items-center rounded-lg p-8 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-white/10 text-slate-300">
          <FileSearch className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-white">{title}</h2>
        {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
      </div>
    </div>
  );
}
