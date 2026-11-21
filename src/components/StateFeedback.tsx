import { Link } from 'react-router-dom';
import { AlertCircle, SearchX, type LucideIcon } from 'lucide-react';

export function LoadingGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-[var(--color-border)] bg-white overflow-hidden animate-pulse"
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
        <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="font-display text-sm font-semibold text-red-950">Unable to load data</h3>
          <p className="text-sm text-red-800 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 text-xs font-semibold text-red-900 bg-white border border-red-300 rounded-lg hover:bg-red-100 cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
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
  icon: Icon = SearchX,
  actionLabel = 'Reset Filters',
  actionTo,
  onReset,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionTo?: string;
  onReset?: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white py-12 px-6 text-center max-w-xl mx-auto">
      <div
        className="w-11 h-11 rounded-xl bg-[var(--color-tint-blue)] border border-blue-200 text-[var(--color-blue)] inline-flex items-center justify-center mx-auto mb-3.5"
        aria-hidden="true"
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-display text-base font-bold text-[var(--color-navy)]">{title}</h3>
      <p className="text-sm text-[var(--color-text)] mt-1.5 leading-relaxed">{description}</p>
      {actionTo ? (
        <Link
          to={actionTo}
          className="mt-5 inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-[var(--color-navy)] hover:bg-[var(--color-blue)] rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]"
        >
          {actionLabel}
        </Link>
      ) : (
        onReset && (
          <button
            type="button"
            onClick={onReset}
            className="mt-5 inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-[var(--color-navy)] hover:bg-[var(--color-blue)] rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
