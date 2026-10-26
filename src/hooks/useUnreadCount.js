import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { alumniService } from '../services/alumniService';

export const NOTIFICATIONS_CHANGED = 'notifications-changed';

/** Unread notification count for the header bell (GET /alumni/notifications → meta.unreadCount). */
export function useUnreadCount(enabled) {
  const [count, setCount] = useState(0);
  const { pathname } = useLocation();

  const load = useCallback(() => {
    if (!enabled) return;
    alumniService.notifications({ page: 1, limit: 1 }).then((r) => setCount(r.meta?.unreadCount ?? 0)).catch(() => {});
  }, [enabled]);

  useEffect(load, [load, pathname]);
  useEffect(() => {
    if (!enabled) return undefined;
    const t = setInterval(load, 60000);
    window.addEventListener(NOTIFICATIONS_CHANGED, load);
    return () => { clearInterval(t); window.removeEventListener(NOTIFICATIONS_CHANGED, load); };
  }, [enabled, load]);

  return count;
}
