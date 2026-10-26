import { ChevronLeft, ChevronRight } from 'lucide-react';

/** `meta` is the backend's { page, limit, total, totalPages }. */
export default function Pagination({ meta, onPage }) {
  if (!meta || meta.total === 0) return null;
  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);
  return (
    <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row">
      <span>{from}–{to} of {meta.total}</span>
      <div className="flex items-center gap-2">
        <button className="btn-secondary px-2 py-1.5" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
        <span>Page {meta.page} of {Math.max(meta.totalPages, 1)}</span>
        <button className="btn-secondary px-2 py-1.5" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
