import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Field, { Input } from '../../components/forms/Field';
import { Alert } from '../../components/common/States';
import { Spinner } from '../../components/common/Spinner';
import GoogleButton, { googleAvailable } from '../../components/common/GoogleButton';
import { useAuth } from '../../context/AuthContext';
import { useMeta } from '../../context/MetaContext';
import { homePath } from '../../utils/roles';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const { googleEnabled } = useMeta();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const done = (user) => navigate(user ? homePath(user) : '/', { replace: true });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { done(await login(form.email.trim(), form.password)); } catch (err) { setError(err); setBusy(false); }
  };

  const google = async (idToken) => {
    setBusy(true); setError(null);
    try {
      done(await loginWithGoogle(idToken));
    } catch (err) {
      if (err.code === 'REGISTRATION_REQUIRED') {
        navigate('/register', { state: { googleIdToken: idToken, email: err.details?.email, name: err.details?.name } });
        return;
      }
      setError(err); setBusy(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Access your alumni account.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <Alert>
            {error.code === 'ACCOUNT_LINK_REQUIRED'
              ? 'An account with this email already exists. Sign in with your password, then link Google from Account & security.'
              : error.message}
          </Alert>
        )}
        <Field label="Email" name="email" error={error?.fieldErrors?.email}>
          <Input type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required autoFocus />
        </Field>
        <Field label="Password" name="password" error={error?.fieldErrors?.password}>
          <Input type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />
        </Field>
        <div className="flex justify-end"><Link to="/forgot-password" className="text-sm text-teal-700 hover:underline">Forgot password?</Link></div>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner />} Sign in</button>
      </form>
      {googleAvailable(googleEnabled) && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
          <GoogleButton onCredential={google} text="signin_with" />
        </>
      )}
      <p className="mt-6 text-center text-sm text-slate-600">
        New alumnus? <Link to="/register" state={location.state} className="font-medium text-teal-700 hover:underline">Register</Link>
      </p>
    </AuthLayout>
  );
}
