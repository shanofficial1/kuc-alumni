import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, XCircle, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { PageLoader } from '../../components/common/Spinner';
import { ErrorState } from '../../components/common/States';
import StatusBadge from '../../components/common/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { alumniService } from '../../services/alumniService';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/format';

export default function Status() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => alumniService.status(), []);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    const user = await refresh(); // router guards move approved users to the member area
    if (user?.approvalStatus === 'approved') navigate('/app/profile', { replace: true });
    else await reload();
    setChecking(false);
  };

  if (loading && !data) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const rejected = data.approvalStatus === 'rejected';

  return (
    <>
      <PageHeader title="Registration status" subtitle="Your profile unlocks once an administrator approves your registration." />
      <div className="card max-w-2xl p-6">
        <div className="flex items-start gap-4">
          {rejected ? <XCircle className="h-8 w-8 shrink-0 text-red-500" /> : <Clock className="h-8 w-8 shrink-0 text-amber-500" />}
          <div className="flex-1">
            <div className="flex items-center gap-2"><h2 className="font-semibold text-slate-900">{rejected ? 'Registration not approved' : 'Awaiting approval'}</h2><StatusBadge value={data.approvalStatus} /></div>
            <p className="mt-1 text-sm text-slate-600">
              {rejected ? 'The administrators reviewed your registration and could not approve it.' : 'Your registration was received and is waiting for an administrator to review it.'}
            </p>
            {rejected && data.rejectionReason && (
              <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800"><span className="font-medium">Reason:</span> {data.rejectionReason}</div>
            )}
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-slate-500">Registered</dt><dd>{formatDateTime(data.registeredAt)}</dd></div>
              {rejected && <div><dt className="text-slate-500">Reviewed</dt><dd>{formatDateTime(data.rejectedAt)}</dd></div>}
            </dl>
            <button className="btn-secondary mt-5" onClick={check} disabled={checking}><RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} /> Check status</button>
          </div>
        </div>
      </div>
    </>
  );
}
