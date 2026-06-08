export default function LoadingState({ label = 'Loading data...' }) {
  return (
    <div className="glass-panel grid min-h-44 place-items-center rounded-lg p-6">
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-mint" />
        <p className="mt-4 text-sm font-semibold text-slate-300">{label}</p>
      </div>
    </div>
  );
}
