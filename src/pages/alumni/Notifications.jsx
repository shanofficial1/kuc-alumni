import { useState } from 'react';
import { BellOff, CheckCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState } from '../../components/common/States';
import { useAsync } from '../../hooks/useAsync';
import { NOTIFICATIONS_CHANGED } from '../../hooks/useUnreadCount';
import { alumniService } from '../../services/alumniService';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/format';

const TYPE_LABEL = { approval: 'Approval', rejection: 'Rejection', account: 'Account', announcement: 'Announcement' };

export default function Notifications() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, loading, error, reload } = useAsync(
    () => alumniService.notifications({ page, limit: 10, unread: unreadOnly ? 'true' : undefined }),
    [page, unreadOnly],
  );

  const changed = async () => { window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED)); await reload(); };
  const markRead = async (id) => {
    try { await alumniService.markRead(id); await changed(); } catch (e) { toast.error(e.message); }
  };
  const markAll = async () => {
    try { const d = await alumniService.markAllRead(); toast.success(`${d.updated} marked as read`); await changed(); } catch (e) { toast.error(e.message); }
  };

  const items = data?.data || [];
  const unreadCount = data?.meta?.unreadCount ?? 0;

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount ? `${unreadCount} unread` : 'You’re all caught up'}
        actions={(
          <>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={unreadOnly} onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1); }} /> Unread only
            </label>
            <button className="btn-secondary" onClick={markAll} disabled={!unreadCount}><CheckCheck className="h-4 w-4" /> Mark all as read</button>
          </>
        )}
      />
      <div className="card">
        {loading && !data ? <PageLoader /> : error ? <ErrorState error={error} onRetry={reload} /> : items.length === 0 ? (
          <EmptyState icon={BellOff} title={unreadOnly ? 'No unread notifications' : 'No notifications yet'}>Messages from the administrators will appear here.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li key={n.id} className={`flex gap-3 px-4 py-4 sm:px-5 ${n.isRead ? '' : 'bg-teal-50/50'}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-teal-600'}`} aria-label={n.isRead ? 'Read' : 'Unread'} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="font-medium text-slate-900">{n.title}</p>
                    <span className="text-xs text-slate-500">{TYPE_LABEL[n.type] || n.type} · {formatDateTime(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-600">{n.message}</p>
                </div>
                {!n.isRead && <button className="btn-ghost self-start px-2 py-1 text-xs" onClick={() => markRead(n.id)}>Mark read</button>}
              </li>
            ))}
          </ul>
        )}
        <Pagination meta={data?.meta} onPage={setPage} />
      </div>
    </>
  );
}
