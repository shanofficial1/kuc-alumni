import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Field, { Input } from '../../components/forms/Field';
import { Alert } from '../../components/common/States';
import { Spinner } from '../../components/common/Spinner';
import GoogleButton, { googleAvailable } from '../../components/common/GoogleButton';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useMeta } from '../../context/MetaContext';
import { useToast } from '../../context/ToastContext';

function ChangePassword() {
  const toast = useToast();
  const empty = { currentPassword: '', newPassword: '', confirm: '' };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { setError({ fieldErrors: { confirm: 'Passwords do not match' }, message: 'Passwords do not match' }); return; }
    setBusy(true); setError(null);
    try {
      const body = { newPassword: form.newPassword };
      if (form.currentPassword) body.currentPassword = form.currentPassword;
      const d = await authService.changePassword(body);
      toast.success(d.message);
      setForm(empty);
    } catch (err) { setError(err); }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-5 sm:p-6" noValidate>
      <h2 className="font-semibold text-slate-900">Change password</h2>
      {error && !Object.keys(error.fieldErrors || {}).length && <Alert>{error.message}</Alert>}
      <Field label="Current password" name="currentPassword" error={error?.fieldErrors?.currentPassword} hint="Leave blank only if you signed up with Google and never set a password.">
        <Input type="password" name="currentPassword" value={form.currentPassword} onChange={set} autoComplete="current-password" />
      </Field>
      <Field label="New password" name="newPassword" error={error?.fieldErrors?.newPassword} hint="At least 10 characters with a letter and a number.">
        <Input type="password" name="newPassword" value={form.newPassword} onChange={set} autoComplete="new-password" required />
      </Field>
      <Field label="Confirm new password" name="confirm" error={error?.fieldErrors?.confirm}>
        <Input type="password" name="confirm" value={form.confirm} onChange={set} autoComplete="new-password" required />
      </Field>
      <p className="text-xs text-slate-500">Other devices are signed out after you change your password.</p>
      <button className="btn-primary" disabled={busy}>{busy && <Spinner />} Update password</button>
    </form>
  );
}

function LinkGoogle() {
  const { linkedProviders, refresh } = useAuth();
  const { googleEnabled } = useMeta();
  const toast = useToast();
  const [idToken, setIdToken] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!googleAvailable(googleEnabled)) return null;
  const linked = linkedProviders.includes('google');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await authService.linkGoogle(idToken, password);
      await refresh();
      setIdToken(null); setPassword('');
      toast.success('Google account linked');
    } catch (err) { setError(err); }
    setBusy(false);
  };

  return (
    <div className="card space-y-4 p-5 sm:p-6">
      <h2 className="font-semibold text-slate-900">Google sign-in</h2>
      {linked ? (
        <p className="text-sm text-slate-600">Your Google account is linked. You can sign in with Google or your password.</p>
      ) : (
        <>
          <p className="text-sm text-slate-600">Link your Google account to sign in with one click. Its email must match your account email.</p>
          {error && <Alert>{error.message}</Alert>}
          {!idToken ? <GoogleButton onCredential={setIdToken} text="continue_with" /> : (
            <form onSubmit={submit} className="space-y-3">
              <Alert tone="success">Google account selected. Confirm with your current password.</Alert>
              <Field label="Current password" name="linkPassword">
                <Input type="password" name="linkPassword" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              </Field>
              <div className="flex gap-2">
                <button className="btn-primary" disabled={busy}>{busy && <Spinner />} Link account</button>
                <button type="button" className="btn-secondary" onClick={() => setIdToken(null)}>Cancel</button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

export default function Account() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Account & security" subtitle={user?.email} />
      <div className="max-w-xl space-y-6">
        <ChangePassword />
        <LinkGoogle />
      </div>
    </>
  );
}
