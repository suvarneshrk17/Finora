export default function ErrorBanner({ message, onRetry }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-lg border border-rose/30 bg-rose/10 p-4 text-sm text-rose">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="focus-ring rounded-md bg-rose px-3 py-1.5 text-xs font-bold text-white hover:bg-rose/90"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
