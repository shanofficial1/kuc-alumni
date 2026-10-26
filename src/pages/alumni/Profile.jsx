import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { PageLoader, Spinner } from '../../components/common/Spinner';
import { Alert, ErrorState } from '../../components/common/States';
import StatusBadge from '../../components/common/StatusBadge';
import ProfileFields from '../../components/forms/ProfileFields';
import { useAsync } from '../../hooks/useAsync';
import { alumniService } from '../../services/alumniService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { buildProfileDiff, profileFromUser } from '../../utils/profile';
import { formatDate } from '../../utils/format';

export default function Profile() {
  const toast = useToast();
  const { refresh } = useAuth();
  const { data: user, loading, error, reload } = useAsync(() => alumniService.getProfile(), []);
  const [values, setValues] = useState(null);
  const [initial, setInitial] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) { const p = profileFromUser(user); setValues(p); setInitial(p); } }, [user]);

  if (loading && !user) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!values) return null;

  const diff = buildProfileDiff(initial, values);
  const dirty = Object.keys(diff).length > 0;

  const submit = async (e) => {
    e.preventDefault();
    setErrors({}); setFormError(null); setBusy(true);
    try {
      const updated = await alumniService.updateProfile(diff);
      const p = profileFromUser(updated);
      setValues(p); setInitial(p);
      refresh();
      toast.success('Profile updated');
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setFormError(Object.keys(err.fieldErrors || {}).length ? 'Please fix the highlighted fields.' : err.message);
    }
    setBusy(false);
  };

  return (
    <>
      <PageHeader title="My profile" subtitle={`Member since ${formatDate(user.registeredAt)}`} actions={<StatusBadge value={user.approvalStatus} />} />
      <form onSubmit={submit} className="card max-w-3xl space-y-5 p-5 sm:p-6" noValidate>
        {formError && <Alert>{formError}</Alert>}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input" value={user.email} disabled />
          <p className="mt-1 text-xs text-slate-500">Your email can’t be changed here.</p>
        </div>
        <ProfileFields values={values} onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))} errors={errors} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" disabled={!dirty || busy} onClick={() => { setValues(initial); setErrors({}); setFormError(null); }}>Discard changes</button>
          <button className="btn-primary" disabled={!dirty || busy}>{busy && <Spinner />} Save changes</button>
        </div>
      </form>
    </>
  );
}
