import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, Check, ClipboardList, ExternalLink, Pencil, RotateCcw, Send, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { PageLoader, Spinner } from '../../components/common/Spinner';
import { Alert, ErrorState } from '../../components/common/States';
import ProfileFields from '../../components/forms/ProfileFields';
import { useAsync } from '../../hooks/useAsync';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { buildProfileDiff, profileFromUser } from '../../utils/profile';
import { batchLabel, categoryLabel, formatDateTime, phoneLabel } from '../../utils/format';

function Item({ label, children }) {
  return <div><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-0.5 break-words text-sm text-slate-900">{children || '—'}</dd></div>;
}

function ExtLink({ href }) {
  if (!href) return null;
  return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal-700 hover:underline">{href.replace(/^https?:\/\//, '')}<ExternalLink className="h-3 w-3" /></a>;
}

function EditDialog({ open, user, onClose, onSaved }) {
  const [values, setValues] = useState(profileFromUser(user));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setValues(profileFromUser(user)); setErrors({}); setFormError(null); } }, [open, user]);

  const diff = buildProfileDiff(profileFromUser(user), values);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({}); setFormError(null);
    try { onSaved(await adminService.updateAlumni(user.id, diff)); onClose(); } catch (err) {
      setErrors(err.fieldErrors || {});
      setFormError(Object.keys(err.fieldErrors || {}).length ? 'Please fix the highlighted fields.' : err.message);
    }
    setBusy(false);
  };

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title="Edit alumni profile" size="max-w-2xl" footer={(
      <>
        <button className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn-primary" form="edit-alumni" disabled={busy || !Object.keys(diff).length}>{busy && <Spinner />} Save changes</button>
      </>
    )}>
      <form id="edit-alumni" onSubmit={submit} className="space-y-4" noValidate>
        {formError && <Alert>{formError}</Alert>}
        <ProfileFields values={values} onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))} errors={errors} />
      </form>
    </Modal>
  );
}

export default function AlumniDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => adminService.getAlumni(id), [id]);
  const [user, setUser] = useState(null);
  const [dialog, setDialog] = useState(null); // 'approve' | 'reject' | 'suspend' | 'reactivate' | 'edit'
  useEffect(() => { if (data) setUser(data.user); }, [data]);

  if (loading && !data) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!user) return null;

  const close = () => setDialog(null);
  const act = (fn, msg) => async (reason) => { setUser(await fn(reason)); toast.success(msg); };

  return (
    <>
      <Link to="/admin/alumni" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> All alumni</Link>
      <PageHeader
        title={user.fullName}
        subtitle={user.email}
        actions={(
          <>
            {['pending', 'rejected'].includes(user.approvalStatus) && <button className="btn-primary" onClick={() => setDialog('approve')}><Check className="h-4 w-4" /> Approve</button>}
            {user.approvalStatus === 'pending' && <button className="btn-secondary" onClick={() => setDialog('reject')}><X className="h-4 w-4" /> Reject</button>}
            {user.accountStatus === 'active'
              ? <button className="btn-secondary" onClick={() => setDialog('suspend')}><Ban className="h-4 w-4" /> Suspend</button>
              : <button className="btn-secondary" onClick={() => setDialog('reactivate')}><RotateCcw className="h-4 w-4" /> Reactivate</button>}
            <button className="btn-secondary" onClick={() => setDialog('edit')}><Pencil className="h-4 w-4" /> Edit</button>
          </>
        )}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-900">Profile</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Phone">{phoneLabel(user)}</Item>
            <Item label="Category">{categoryLabel(user.category)}</Item>
            <Item label="Program">{user.program}</Item>
            <Item label="Academic years">{batchLabel(user)}</Item>
            <Item label="Working status">{user.workingStatus}</Item>
            <Item label="Company">{user.companyName}</Item>
            <Item label="Company website"><ExtLink href={user.companyWebsite} /></Item>
            <Item label="LinkedIn"><ExtLink href={user.linkedinUrl} /></Item>
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-900">Account</h2>
          <div className="mb-4 flex gap-2"><StatusBadge value={user.approvalStatus} /><StatusBadge value={user.accountStatus} /></div>
          <dl className="space-y-3">
            <Item label="Registered">{formatDateTime(user.registeredAt)}</Item>
            {user.approvedAt && <Item label="Approved">{formatDateTime(user.approvedAt)}</Item>}
            {user.rejectedAt && <Item label="Rejected">{formatDateTime(user.rejectedAt)}</Item>}
            {user.rejectionReason && <Item label="Rejection reason">{user.rejectionReason}</Item>}
            {user.statusChangedAt && <Item label="Last status change">{formatDateTime(user.statusChangedAt)}</Item>}
            {user.statusReason && <Item label="Status reason">{user.statusReason}</Item>}
            <Item label="Last sign-in">{formatDateTime(user.lastLoginAt)}</Item>
            <Item label="Linked sign-in">{data.linkedProviders?.join(', ')}</Item>
          </dl>
          <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4">
            <Link className="btn-secondary" to={`/admin/notifications?userId=${user.id}&name=${encodeURIComponent(user.fullName)}`}><Send className="h-4 w-4" /> Send message</Link>
            <Link className="btn-secondary" to={`/admin/activity-logs?resourceType=alumni&resourceId=${user.id}`}><ClipboardList className="h-4 w-4" /> View activity</Link>
          </div>
        </section>
      </div>

      <ConfirmDialog open={dialog === 'approve'} onClose={close} title="Approve registration" message={`Approve ${user.fullName}? They will get full access to the portal.`} confirmLabel="Approve" onConfirm={act(() => adminService.approve(user.id), 'Registration approved')} />
      <ConfirmDialog open={dialog === 'reject'} onClose={close} title="Reject registration" danger message={`Reject ${user.fullName}’s registration? The reason is shown to them.`} reasonLabel="Reason for rejection" reasonMin={5} confirmLabel="Reject" onConfirm={act((r) => adminService.reject(user.id, r), 'Registration rejected')} />
      <ConfirmDialog open={dialog === 'suspend'} onClose={close} title="Suspend account" danger message={`${user.fullName} will be signed out immediately and can’t sign in until reactivated.`} reasonLabel="Reason for suspension" reasonMin={3} confirmLabel="Suspend" onConfirm={act((r) => adminService.setStatus(user.id, 'suspended', r), 'Account suspended')} />
      <ConfirmDialog open={dialog === 'reactivate'} onClose={close} title="Reactivate account" message={`Allow ${user.fullName} to sign in again?`} confirmLabel="Reactivate" onConfirm={act(() => adminService.setStatus(user.id, 'active'), 'Account reactivated')} />
      <EditDialog open={dialog === 'edit'} user={user} onClose={close} onSaved={(u) => { setUser(u); toast.success('Profile updated'); }} />
    </>
  );
}
