import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Globe2, UserCheck, UserX, Users } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState } from '../../components/common/States';
import { Select } from '../../components/forms/Field';
import { useAsync } from '../../hooks/useAsync';
import { adminService } from '../../services/adminService';

function StatCard({ label, value, icon: Icon, to, tone = 'text-navy-700' }) {
  const body = (
    <div className="card flex items-center gap-4 p-4 transition-colors hover:border-teal-300">
      <div className={`rounded-md bg-slate-100 p-2.5 ${tone}`}><Icon className="h-5 w-5" /></div>
      <div><p className="text-2xl font-semibold text-slate-900">{value}</p><p className="text-sm text-slate-500">{label}</p></div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function BarList({ title, rows, labelKey, to }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="card p-5">
      <h2 className="mb-4 font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? <p className="text-sm text-slate-500">No data yet.</p> : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const label = r[labelKey];
            const inner = (
              <>
                <div className="mb-1 flex justify-between text-sm"><span className="truncate pr-2 text-slate-700">{label}</span><span className="font-medium text-slate-900">{r.count}</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-teal-600" style={{ width: `${(r.count / max) * 100}%` }} /></div>
              </>
            );
            return <li key={label}>{to ? <Link to={to(r)} className="block hover:opacity-80">{inner}</Link> : inner}</li>;
          })}
        </ul>
      )}
    </section>
  );
}

function OverTime({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="flex h-44 items-end gap-1.5 overflow-x-auto pb-1">
      {rows.map((r) => (
        <div key={r.period} className="flex min-w-[2rem] flex-1 flex-col items-center justify-end gap-1" title={`${r.period}: ${r.count}`}>
          <span className="text-xs text-slate-600">{r.count || ''}</span>
          <div className="w-full rounded-t bg-navy-600" style={{ height: `${Math.max((r.count / max) * 100, r.count ? 4 : 1)}%`, minHeight: 2 }} />
          <span className="text-[10px] text-slate-500">{r.period.slice(2)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [months, setMonths] = useState(12);
  const { data, loading, error, reload } = useAsync(() => adminService.stats(months), [months]);

  if (loading && !data) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const t = data.totals;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Registrations and alumni breakdown." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Registrations" value={t.registrations} icon={Users} to="/admin/alumni" />
        <StatCard label="Pending" value={t.pending} icon={Clock} tone="text-amber-600" to="/admin/alumni?approvalStatus=pending" />
        <StatCard label="Approved" value={t.approved} icon={UserCheck} tone="text-teal-700" to="/admin/alumni?approvalStatus=approved" />
        <StatCard label="Rejected" value={t.rejected} icon={UserX} tone="text-red-600" to="/admin/alumni?approvalStatus=rejected" />
        <StatCard label="Indian" value={t.indian} icon={Globe2} to="/admin/alumni?category=indian" />
        <StatCard label="NRI" value={t.nri} icon={Globe2} to="/admin/alumni?category=nri" />
      </div>

      <section className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Registrations over time</h2>
          <Select name="months" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-auto" options={[6, 12, 24, 36].map((m) => ({ value: m, label: `Last ${m} months` }))} />
        </div>
        {data.registrationsOverTime.some((r) => r.count) ? <OverTime rows={data.registrationsOverTime} /> : <EmptyState title="No registrations in this period" />}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <BarList title="By program" rows={data.byProgram} labelKey="program" to={(r) => `/admin/alumni?program=${encodeURIComponent(r.program)}`} />
        <BarList title="By academic year" rows={data.byAcademicYear} labelKey="label" to={(r) => `/admin/alumni?academicYearStart=${r.academicYearStart}&academicYearEnd=${r.academicYearEnd}`} />
        <BarList title="By working status" rows={data.byWorkingStatus} labelKey="workingStatus" to={(r) => `/admin/alumni?workingStatus=${encodeURIComponent(r.workingStatus)}`} />
      </div>
    </>
  );
}
