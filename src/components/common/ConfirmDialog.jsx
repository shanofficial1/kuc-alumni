import { useEffect, useState } from 'react';
import Modal from './Modal';
import { Alert } from './States';
import { Spinner } from './Spinner';

/**
 * Confirmation for destructive / state-changing actions. With `reasonLabel` it also collects a reason
 * (the backend requires one to reject: >= 5 chars, and to suspend: >= 3 chars).
 * `onConfirm(reason)` should return a promise; throwing keeps the dialog open and shows the error.
 */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, reasonLabel, reasonMin = 0, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { if (open) { setReason(''); setError(null); setBusy(false); } }, [open]);

  const tooShort = reasonLabel && reason.trim().length < reasonMin;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onConfirm(reasonLabel ? reason.trim() : undefined);
      onClose();
    } catch (err) {
      setError(err.fieldErrors?.reason || err.message);
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={busy ? () => {} : onClose}
      footer={(
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" form="confirm-form" className={danger ? 'btn-danger' : 'btn-primary'} disabled={busy || tooShort}>
            {busy && <Spinner />} {confirmLabel}
          </button>
        </>
      )}
    >
      <form id="confirm-form" onSubmit={submit} className="space-y-3">
        <p className="text-sm text-slate-600">{message}</p>
        {reasonLabel && (
          <div>
            <label htmlFor="confirm-reason" className="label">{reasonLabel}</label>
            <textarea id="confirm-reason" rows={3} className="input" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} autoFocus />
            <p className="mt-1 text-xs text-slate-500">At least {reasonMin} characters.</p>
          </div>
        )}
        {error && <Alert>{error}</Alert>}
      </form>
    </Modal>
  );
}
