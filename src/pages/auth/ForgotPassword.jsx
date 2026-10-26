import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Field, { Input } from '../../components/forms/Field';
import { Alert } from '../../components/common/States';
import { Spinner } from '../../components/common/Spinner';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { setMessage((await authService.forgotPassword(email.trim())).message); } catch (err) { setError(err); }
    setBusy(false);
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we’ll send a reset link.">
      {message ? (
        <div className="space-y-4"><Alert tone="success">{message}</Alert><Link to="/login" className="btn-secondary w-full">Back to sign in</Link></div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && <Alert>{error.message}</Alert>}
          <Field label="Email" name="email" error={error?.fieldErrors?.email}>
            <Input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </Field>
          <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner />} Send reset link</button>
          <p className="text-center text-sm"><Link to="/login" className="text-teal-700 hover:underline">Back to sign in</Link></p>
        </form>
      )}
    </AuthLayout>
  );
}
