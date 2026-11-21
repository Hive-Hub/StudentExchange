import { AlertCircle, SearchX } from 'lucide-react';

export function LoadingGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-200 bg-white overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] bg-slate-100" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-5 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-2/3 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="font-display text-sm font-semibold text-red-900">Unable to load data</h3>
          <p className="text-sm text-red-700 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 text-xs font-semibold text-red-800 bg-white border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer shrink-0"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  onReset,
}: {
  title: string;
  description: string;
  onReset?: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 py-14 px-6 text-center max-w-xl mx-auto">
      <SearchX className="w-8 h-8 text-slate-400 mx-auto mb-3" aria-hidden="true" />
      <h3 className="font-display text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1.5">{description}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
