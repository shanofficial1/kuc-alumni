import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Field, { Input } from '../../components/forms/Field';
import { Alert } from '../../components/common/States';
import { Spinner } from '../../components/common/Spinner';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError({ message: 'Passwords do not match', fieldErrors: { confirm: 'Passwords do not match' } }); return; }
    setBusy(true); setError(null);
    try {
      const d = await authService.resetPassword(token, form.password);
      toast.success(d.message);
      navigate('/login', { replace: true });
    } catch (err) { setError(err); setBusy(false); }
  };

  if (!token) {
    return (
      <AuthLayout title="Reset link missing">
        <Alert>This page needs the link from your reset email.</Alert>
        <Link to="/forgot-password" className="btn-secondary mt-4 w-full">Request a new link</Link>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout title="Choose a new password" subtitle="Signing in again is required on all devices after this.">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert>{error.message}{error.code === 'INVALID_OR_EXPIRED_TOKEN' && <> <Link to="/forgot-password" className="underline">Request a new link</Link>.</>}</Alert>}
        <Field label="New password" name="password" error={error?.fieldErrors?.password} hint="At least 10 characters with a letter and a number.">
          <Input type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" required autoFocus />
        </Field>
        <Field label="Confirm new password" name="confirm" error={error?.fieldErrors?.confirm}>
          <Input type="password" name="confirm" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" required />
        </Field>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner />} Update password</button>
      </form>
    </AuthLayout>
  );
}
