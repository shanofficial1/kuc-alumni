import { AlertCircle, Inbox } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title, children }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <Icon className="h-8 w-8 text-slate-300" />
      <p className="mt-3 text-sm font-medium text-slate-700">{title}</p>
      {children && <div className="mt-1 text-sm text-slate-500">{children}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <AlertCircle className="h-8 w-8 text-red-400" />
      <p className="mt-3 text-sm font-medium text-slate-700">{error?.message || 'Something went wrong'}</p>
      {error?.requestId && <p className="mt-1 text-xs text-slate-400">Request ID: {error.requestId}</p>}
      {onRetry && <button className="btn-secondary mt-4" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Alert({ tone = 'error', children }) {
  const cls = {
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    success: 'border-teal-200 bg-teal-50 text-teal-900',
    info: 'border-slate-200 bg-slate-50 text-slate-700',
  }[tone];
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md border px-3 py-2.5 text-sm ${cls}`}>{children}</div>;
}
