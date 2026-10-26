import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Download, Search, UsersRound, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { PageLoader, Spinner } from '../../components/common/Spinner';
import { Alert, EmptyState, ErrorState } from '../../components/common/States';
import { Input, Select } from '../../components/forms/Field';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { adminService } from '../../services/adminService';
import { useMeta } from '../../context/MetaContext';
import { useToast } from '../../context/ToastContext';
import { EXPORT_PRESETS, batchLabel, categoryLabel, formatDate } from '../../utils/format';

const FILTERS = ['search', 'program', 'category', 'workingStatus', 'approvalStatus', 'accountStatus', 'academicYearStart', 'academicYearEnd'];
const COLUMNS = [
  { key: 'fullName', label: 'Alumnus' },
  { key: 'program', label: 'Program' },
  { key: 'academicYearStart', label: 'Batch' },
  { key: 'category', label: 'Category' },
  { key: 'workingStatus', label: 'Working status' },
  { key: 'approvalStatus', label: 'Status' },
  { key: 'registeredAt', label: 'Registered' },
];

function ExportDialog({ open, onClose, query }) {
  const toast = useToast();
  const [format, setFormat] = useState('excel');
  const [preset, setPreset] = useState('filtered');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { if (open) setError(null); }, [open]);

  const run = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const { filename, rowCount } = await adminService.exportFile(format, { ...query, preset });
      toast.success(`Exported ${Number.isNaN(rowCount) ? '' : `${rowCount} rows to `}${filename}`);
      onClose();
    } catch (err) { setError(err); }
    setBusy(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Export alumni" footer={(
      <>
        <button className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn-primary" form="export-form" disabled={busy}>{busy ? <Spinner /> : <Download className="h-4 w-4" />} Download</button>
      </>
    )}>
      <form id="export-form" onSubmit={run} className="space-y-4">
        {error && <Alert>{error.code === 'CONFLICTING_FILTER' ? `${error.message}. Clear that filter or pick “Current filters”.` : error.message}</Alert>}
        <div>
          <p className="label">Format</p>
          <div className="flex gap-4 text-sm">
            {[['excel', 'Excel (.xlsx)'], ['csv', 'CSV']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2"><input type="radio" name="format" checked={format === v} onChange={() => setFormat(v)} /> {l}</label>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="preset" className="label">Rows to include</label>
          <Select name="preset" value={preset} onChange={(e) => setPreset(e.target.value)} options={EXPORT_PRESETS} />
          <p className="mt-1 text-xs text-slate-500">“Current filters” uses the search, filters and sort shown in the table. The file has a fixed set of columns chosen by the server, and every export is recorded in the activity log.</p>
        </div>
      </form>
    </Modal>
  );
}

export default function AlumniList() {
  const { programs, workingStatuses, categories } = useMeta();
  const [sp, setSp] = useSearchParams();
  const get = (k, d = '') => sp.get(k) || d;
  const [search, setSearch] = useState(get('search'));
  const debounced = useDebounce(search);
  const [exportOpen, setExportOpen] = useState(false);

  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, v)));
    if (!('page' in patch)) next.delete('page');
    setSp(next, { replace: true });
  };
  useEffect(() => { if (debounced !== get('search')) update({ search: debounced }); /* eslint-disable-next-line */ }, [debounced]);

  const sortBy = get('sortBy', 'registeredAt');
  const sortOrder = get('sortOrder', 'desc');
  const page = Number(get('page', 1));
  const query = Object.fromEntries(FILTERS.map((k) => [k, get(k)]).concat([['sortBy', sortBy], ['sortOrder', sortOrder]]));

  const { data, loading, error, reload } = useAsync(
    () => adminService.listAlumni({ ...query, page, limit: 20 }),
    [sp.toString()],
  );

  const activeFilters = FILTERS.filter((k) => k !== 'search' && get(k)).length + (get('search') ? 1 : 0);
  const clear = () => { setSearch(''); setSp({}, { replace: true }); };
  const sort = (key) => update({ sortBy: key, sortOrder: sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc' });
  const rows = data?.data || [];

  return (
    <>
      <PageHeader title="Alumni" subtitle="Review registrations and manage alumni accounts." actions={<button className="btn-secondary" onClick={() => setExportOpen(true)}><Download className="h-4 w-4" /> Export</button>} />

      <div className="card mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" className="pl-9" aria-label="Search" maxLength={100} />
          </div>
          <Select name="approvalStatus" aria-label="Approval status" value={get('approvalStatus')} onChange={(e) => update({ approvalStatus: e.target.value })} placeholder="Any approval status" options={['pending', 'approved', 'rejected']} />
          <Select name="accountStatus" aria-label="Account status" value={get('accountStatus')} onChange={(e) => update({ accountStatus: e.target.value })} placeholder="Any account status" options={['active', 'suspended']} />
          <Select name="program" aria-label="Program" value={get('program')} onChange={(e) => update({ program: e.target.value })} placeholder="Any program" options={programs} />
          <Select name="category" aria-label="Category" value={get('category')} onChange={(e) => update({ category: e.target.value })} placeholder="Any category" options={categories.map((c) => ({ value: c, label: categoryLabel(c) }))} />
          <Select name="workingStatus" aria-label="Working status" value={get('workingStatus')} onChange={(e) => update({ workingStatus: e.target.value })} placeholder="Any working status" options={workingStatuses} />
          <div className="flex gap-2">
            <Input type="number" name="academicYearStart" aria-label="Academic year start" value={get('academicYearStart')} onChange={(e) => update({ academicYearStart: e.target.value })} placeholder="Start year" min={1970} />
            <Input type="number" name="academicYearEnd" aria-label="Academic year end" value={get('academicYearEnd')} onChange={(e) => update({ academicYearEnd: e.target.value })} placeholder="End year" min={1970} />
          </div>
        </div>
        {activeFilters > 0 && <button className="btn-ghost mt-3 px-2 py-1 text-xs" onClick={clear}><X className="h-3.5 w-3.5" /> Clear {activeFilters} filter{activeFilters > 1 ? 's' : ''}</button>}
      </div>

      <div className="card overflow-hidden">
        {loading && !data ? <PageLoader /> : error ? <ErrorState error={error} onRetry={reload} /> : rows.length === 0 ? (
          <EmptyState icon={UsersRound} title="No alumni match these filters">{activeFilters > 0 ? 'Try clearing a filter.' : 'Registrations will appear here.'}</EmptyState>
        ) : (
          <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {COLUMNS.map((c) => (
                    <th key={c.key} className="th" aria-sort={sortBy === c.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      <button className="inline-flex items-center gap-1 hover:text-slate-800" onClick={() => sort(c.key)}>
                        {c.label}{sortBy === c.key && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="td"><Link to={`/admin/alumni/${u.id}`} className="font-medium text-navy-800 hover:underline">{u.fullName}</Link><div className="text-xs text-slate-500">{u.email}</div></td>
                    <td className="td">{u.program}</td>
                    <td className="td whitespace-nowrap">{batchLabel(u)}</td>
                    <td className="td">{categoryLabel(u.category)}</td>
                    <td className="td">{u.workingStatus}</td>
                    <td className="td"><div className="flex flex-wrap gap-1"><StatusBadge value={u.approvalStatus} />{u.accountStatus === 'suspended' && <StatusBadge value="suspended" />}</div></td>
                    <td className="td whitespace-nowrap text-slate-500">{formatDate(u.registeredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={data?.meta} onPage={(p) => update({ page: p })} />
      </div>
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} query={query} />
    </>
  );
}
