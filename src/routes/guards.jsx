import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/Spinner';
import { homePath } from '../utils/roles';

/** Navigation convenience only: the backend re-checks role and approval on every request. */
export function Protected({ allow }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!allow(user)) return <Navigate to={homePath(user)} replace />;
  return <Outlet />;
}

export function PublicOnly() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={homePath(user)} replace />;
  return <Outlet />;
}

export function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return <Navigate to={homePath(user)} replace />;
}
