import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Field, { Input } from '../../components/forms/Field';
import ProfileFields from '../../components/forms/ProfileFields';
import GoogleButton, { googleAvailable } from '../../components/common/GoogleButton';
import { Alert } from '../../components/common/States';
import { Spinner } from '../../components/common/Spinner';
import { authService } from '../../services/authService';
import { useMeta } from '../../context/MetaContext';
import { buildRegisterPayload, emptyProfile } from '../../utils/profile';

export default function Register() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { googleEnabled } = useMeta();
  const [googleToken, setGoogleToken] = useState(state?.googleIdToken || null);
  const [profile, setProfile] = useState({ ...emptyProfile, fullName: state?.name || '' });
  const [account, setAccount] = useState({ email: state?.email || '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  // Picking Google first only supplies a token; the backend requires the token's email to match.
  const onGoogle = async (idToken) => {
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      setGoogleToken(idToken);
      setAccount((a) => ({ ...a, email: payload.email || a.email }));
      setProfile((p) => ({ ...p, fullName: p.fullName || payload.name || '' }));
    } catch { setFormError('Could not read the Google sign-in. Try again.'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({}); setFormError(null);
    if (!googleToken && account.password !== account.confirm) { setErrors({ confirm: 'Passwords do not match' }); return; }
    setBusy(true);
    try {
      const body = { ...buildRegisterPayload(profile), email: account.email.trim() };
      if (googleToken) body.googleIdToken = googleToken;
      if (account.password) body.password = account.password;
      const d = await authService.register(body);
      setMessage(d.message);
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setFormError(Object.keys(err.fieldErrors || {}).length ? 'Please fix the highlighted fields.' : err.message);
      setBusy(false);
    }
  };

  if (message) {
    return (
      <AuthLayout title="Registration received">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-10 w-10 text-teal-600" />
          <p className="mt-3 text-sm text-slate-600">{message}</p>
          <button className="btn-primary mt-6" onClick={() => navigate('/login')}>Go to sign in</button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout wide title="Create your alumni account" subtitle="An administrator reviews every registration before you get full access.">
      <form onSubmit={submit} className="space-y-6" noValidate>
        {formError && <Alert>{formError}</Alert>}
        {googleAvailable(googleEnabled) && !googleToken && (
          <>
            <GoogleButton onCredential={onGoogle} text="signup_with" />
            <div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or use a password<span className="h-px flex-1 bg-slate-200" /></div>
          </>
        )}
        {googleToken && <Alert tone="success">Google account verified. You can register without a password.</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" name="email" error={errors.email} required className="sm:col-span-2">
            <Input type="email" name="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} error={errors.email} readOnly={!!googleToken} autoComplete="email" required />
          </Field>
          <Field label={googleToken ? 'Password (optional)' : 'Password'} name="password" error={errors.password} hint="At least 10 characters with a letter and a number." required={!googleToken}>
            <Input type="password" name="password" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} error={errors.password} autoComplete="new-password" required={!googleToken} />
          </Field>
          {!googleToken && (
            <Field label="Confirm password" name="confirm" error={errors.confirm} required>
              <Input type="password" name="confirm" value={account.confirm} onChange={(e) => setAccount({ ...account, confirm: e.target.value })} error={errors.confirm} autoComplete="new-password" required />
            </Field>
          )}
        </div>

        <ProfileFields values={profile} onChange={(k, v) => setProfile((p) => ({ ...p, [k]: v }))} errors={errors} />

        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner />} Register</button>
        <p className="text-center text-sm text-slate-600">Already registered? <Link to="/login" className="font-medium text-teal-700 hover:underline">Sign in</Link></p>
      </form>
    </AuthLayout>
  );
}
