import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Field, { Input, Select } from '../../components/forms/Field';
import { Alert } from '../../components/common/States';
import { Spinner } from '../../components/common/Spinner';
import { adminService } from '../../services/adminService';
import { useDebounce } from '../../hooks/useDebounce';
import { useMeta } from '../../context/MetaContext';
import { useToast } from '../../context/ToastContext';
import { NOTIFICATION_TYPES, categoryLabel, cap } from '../../utils/format';
import { useEffect } from 'react';

/** Finds one alumnus via GET /admin/alumni?search= (the notification endpoint needs a user id). */
function UserPicker({ value, onChange }) {
  const [q, setQ] = useState('');
  const dq = useDebounce(q);
  const [results, setResults] = useState([]);
  useEffect(() => {
    if (dq.trim().length < 2) { setResults([]); return; }
    adminService.listAlumni({ search: dq.trim(), limit: 6 }).then((r) => setResults(r.data)).catch(() => setResults([]));
  }, [dq]);

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm">
        <span>{value.name}</span>
        <button type="button" onClick={() => onChange(null)} aria-label="Change recipient" className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
      </div>
    );
  }
  return (
    <div className="relative">
      <Input name="recipient" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search alumni by name or email" autoComplete="off" />
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {results.map((u) => (
            <li key={u.id}>
              <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => { onChange({ id: u.id, name: `${u.fullName} (${u.email})` }); setQ(''); setResults([]); }}>
                {u.fullName}<span className="block text-xs text-slate-500">{u.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SendNotification() {
  const [sp] = useSearchParams();
  const { programs, workingStatuses, categories } = useMeta();
  const toast = useToast();
  const preset = sp.get('userId') ? { id: sp.get('userId'), name: sp.get('name') || sp.get('userId') } : null;
  const [audience, setAudience] = useState(preset ? 'user' : 'all_approved');
  const [recipient, setRecipient] = useState(preset);
  const [type, setType] = useState('account');
  const [filters, setFilters] = useState({ program: '', category: '', workingStatus: '', academicYearEnd: '' });
  const [form, setForm] = useState({ title: '', message: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (audience === 'user' && !recipient) { setError({ message: 'Choose a recipient', fieldErrors: {} }); return; }
    setBusy(true); setError(null);
    const body = { audience, title: form.title.trim(), message: form.message.trim() };
    if (audience === 'user') { body.userId = recipient.id; body.type = type; } else {
      const f = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '').map(([k, v]) => [k, k === 'academicYearEnd' ? Number(v) : v]));
      if (Object.keys(f).length) body.filters = f;
    }
    try {
      const d = await adminService.sendNotification(body);
      toast.success(`Sent to ${d.recipients} ${d.recipients === 1 ? 'recipient' : 'recipients'}`);
      setForm({ title: '', message: '' });
    } catch (err) { setError(err); }
    setBusy(false);
  };
  const fe = error?.fieldErrors || {};
  const setF = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <>
      <PageHeader title="Send notification" subtitle="Message one alumnus, or announce to all approved alumni." />
      <form onSubmit={submit} className="card max-w-2xl space-y-5 p-5 sm:p-6" noValidate>
        {error && !Object.keys(fe).length && <Alert>{error.message}</Alert>}
        <div>
          <p className="label">Audience</p>
          <div className="flex gap-5 text-sm">
            <label className="flex items-center gap-2"><input type="radio" checked={audience === 'all_approved'} onChange={() => setAudience('all_approved')} /> All approved alumni</label>
            <label className="flex items-center gap-2"><input type="radio" checked={audience === 'user'} onChange={() => setAudience('user')} /> One alumnus</label>
          </div>
        </div>

        {audience === 'user' ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Recipient" name="recipient" error={fe.userId} className="sm:col-span-2"><UserPicker value={recipient} onChange={setRecipient} /></Field>
            <Field label="Type" name="type"><Select name="type" value={type} onChange={(e) => setType(e.target.value)} options={NOTIFICATION_TYPES.map((t) => ({ value: t, label: cap(t) }))} /></Field>
          </div>
        ) : (
          <fieldset className="rounded-md border border-slate-200 p-4">
            <legend className="px-1 text-sm font-medium text-slate-700">Narrow the audience (optional)</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select name="program" aria-label="Program" value={filters.program} onChange={setF} placeholder="Any program" options={programs} />
              <Select name="category" aria-label="Category" value={filters.category} onChange={setF} placeholder="Any category" options={categories.map((c) => ({ value: c, label: categoryLabel(c) }))} />
              <Select name="workingStatus" aria-label="Working status" value={filters.workingStatus} onChange={setF} placeholder="Any working status" options={workingStatuses} />
              <Input type="number" name="academicYearEnd" aria-label="Academic year end" value={filters.academicYearEnd} onChange={setF} placeholder="Graduation (end) year" min={1970} />
            </div>
            <p className="mt-2 text-xs text-slate-500">Only approved, active alumni receive announcements.</p>
          </fieldset>
        )}

        <Field label="Title" name="title" error={fe.title} required>
          <Input name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={fe.title} maxLength={150} required />
        </Field>
        <Field label="Message" name="message" error={fe.message} required hint={`${form.message.length}/2000`}>
          <textarea id="message" name="message" rows={5} className={`input ${fe.message ? 'input-error' : ''}`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} required />
        </Field>
        <div className="flex justify-end"><button className="btn-primary" disabled={busy}>{busy ? <Spinner /> : <Send className="h-4 w-4" />} Send</button></div>
      </form>
    </>
  );
}
