import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { setUnauthorizedHandler } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const EMPTY = { user: null, access: null, linkedProviders: [] };

export function AuthProvider({ children }) {
  const toast = useToast();
  const [session, setSession] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  /** Reads the current session from GET /auth/me (the session itself is an HTTP-only cookie). */
  const refresh = useCallback(async () => {
    try {
      const d = await authService.me();
      setSession({ user: d.user, access: d.access, linkedProviders: d.linkedProviders || [] });
      return d.user;
    } catch {
      setSession(EMPTY);
      return null;
    }
  }, []);

  useEffect(() => { refresh().finally(() => setLoading(false)); }, [refresh]);

  // Any protected request that comes back 401 / suspended ends the local session.
  useEffect(() => {
    setUnauthorizedHandler((code, message) => {
      setSession(EMPTY);
      toast.error(code === 'ACCOUNT_SUSPENDED' ? message : 'Your session has ended. Please sign in again.');
    });
    return () => setUnauthorizedHandler(null);
  }, [toast]);

  const login = useCallback(async (email, password) => {
    await authService.login(email, password);
    return refresh();
  }, [refresh]);

  const loginWithGoogle = useCallback(async (idToken) => {
    await authService.google(idToken);
    return refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* cookie is cleared server-side; local state is reset regardless */ }
    setSession(EMPTY);
  }, []);

  const value = useMemo(
    () => ({ ...session, loading, login, loginWithGoogle, logout, refresh }),
    [session, loading, login, loginWithGoogle, logout, refresh],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
