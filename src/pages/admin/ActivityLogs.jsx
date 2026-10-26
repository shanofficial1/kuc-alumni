import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardList, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState } from '../../components/common/States';
import { Input, Select } from '../../components/forms/Field';
import { useAsync } from '../../hooks/useAsync';
import { adminService } from '../../services/adminService';
import { AUDIT_ACTIONS, formatDateTime } from '../../utils/format';

const KEYS = ['action', 'resourceType', 'resourceId', 'from', 'to'];

export default function ActivityLogs() {
  const [sp, setSp] = useSearchParams();
  const get = (k) => sp.get(k) || '';
  const page = Number(sp.get('page') || 1);
  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, v)));
    if (!('page' in patch)) next.delete('page');
    setSp(next, { replace: true });
  };
  const [resourceId, setResourceId] = useState(get('resourceId'));
  useEffect(() => { setResourceId(get('resourceId')); /* eslint-disable-next-line */ }, [sp.get('resourceId')]);

  // <input type="date"> gives YYYY-MM-DD; `to` covers the whole selected day.
  const params = {
    action: get('action'), resourceType: get('resourceType'), resourceId: get('resourceId'),
    from: get('from') ? new Date(`${get('from')}T00:00:00`).toISOString() : '',
    to: get('to') ? new Date(`${get('to')}T23:59:59.999`).toISOString() : '',
    page, limit: 25,
  };
  const { data, loading, error, reload } = useAsync(() => adminService.activityLogs(params), [sp.toString()]);
  const rows = data?.data || [];
  const active = KEYS.some((k) => get(k));

  return (
    <>
      <PageHeader title="Activity log" subtitle="A read-only record of administrator actions." />
      <div className="card mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select name="action" aria-label="Action" value={get('action')} onChange={(e) => update({ action: e.target.value })} placeholder="Any action" options={AUDIT_ACTIONS} />
          <Input name="resourceType" aria-label="Resource type" value={get('resourceType')} onChange={(e) => update({ resourceType: e.target.value })} placeholder="Resource type" maxLength={40} />
          <Input name="resourceId" aria-label="Resource id" value={resourceId} onChange={(e) => setResourceId(e.target.value)} onBlur={() => update({ resourceId: resourceId.trim() })} onKeyDown={(e) => e.key === 'Enter' && update({ resourceId: resourceId.trim() })} placeholder="Resource id" maxLength={60} />
          <Input type="date" name="from" aria-label="From date" value={get('from')} onChange={(e) => update({ from: e.target.value })} />
          <Input type="date" name="to" aria-label="To date" value={get('to')} onChange={(e) => update({ to: e.target.value })} />
        </div>
        {active && <button className="btn-ghost mt-3 px-2 py-1 text-xs" onClick={() => setSp({}, { replace: true })}><X className="h-3.5 w-3.5" /> Clear filters</button>}
      </div>

      <div className="card overflow-hidden">
        {loading && !data ? <PageLoader /> : error ? <ErrorState error={error} onRetry={reload} /> : rows.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No activity found">{active ? 'Try widening the filters.' : 'Administrator actions will be recorded here.'}</EmptyState>
        ) : (
          <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50"><tr>{['When', 'Administrator', 'Action', 'Resource', 'Details'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100 align-top">
                {rows.map((l) => (
                  <tr key={l.id}>
                    <td className="td whitespace-nowrap text-slate-500">{formatDateTime(l.timestamp)}</td>
                    <td className="td">{l.admin?.fullName || '—'}<div className="text-xs text-slate-500">{l.admin?.email}</div></td>
                    <td className="td"><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{l.action}</code></td>
                    <td className="td text-xs text-slate-600">{l.resourceType}<div className="break-all text-slate-400">{l.resourceId}</div></td>
                    <td className="td">
                      {l.details && Object.keys(l.details).length > 0 ? (
                        <details><summary className="cursor-pointer text-xs text-teal-700">View</summary><pre className="mt-1 max-w-xs overflow-x-auto whitespace-pre-wrap rounded bg-slate-50 p-2 text-xs">{JSON.stringify(l.details, null, 2)}</pre></details>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={data?.meta} onPage={(p) => update({ page: p })} />
      </div>
    </>
  );
}
