import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, GraduationCap, KeyRound, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUnreadCount } from '../hooks/useUnreadCount';

/**
 * Sidebar + top bar. `nav` = [{ to, label, icon, end? }]. `bell` = path of the notifications page
 * (alumni areas only; admins have no inbox in the backend).
 */
export default function AppShell({ nav, accountPath, bell, roleLabel }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const unread = useUnreadCount(!!bell);

  useEffect(() => { setDrawer(false); setMenu(false); }, [pathname]);
  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const signOut = async () => { await logout(); navigate('/login', { replace: true }); };

  const sidebar = (
    <nav className="flex h-full w-64 flex-col bg-navy-900 text-navy-100">
      <div className="flex h-16 items-center gap-2 px-5 text-white">
        <GraduationCap className="h-6 w-6 text-teal-400" />
        <span className="font-semibold">Alumni Portal</span>
      </div>
      <ul className="flex-1 space-y-1 px-3 py-2">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-navy-700 text-white' : 'text-navy-200 hover:bg-navy-800 hover:text-white'}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <p className="px-5 py-4 text-xs text-navy-300">{roleLabel}</p>
    </nav>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</aside>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setDrawer(false)} />
          <div className="relative h-full w-64">
            {sidebar}
            <button className="absolute right-2 top-4 rounded p-1 text-navy-200" onClick={() => setDrawer(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <button className="rounded p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {bell && (
            <Link to={bell} className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-semibold text-white">{unread > 99 ? '99+' : unread}</span>}
            </Link>
          )}
          <div className="relative" ref={menuRef}>
            <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-800 text-sm font-semibold text-white">{user?.fullName?.[0]?.toUpperCase() || '?'}</span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[10rem] truncate text-sm font-medium text-slate-800">{user?.fullName}</span>
                <span className="block max-w-[10rem] truncate text-xs text-slate-500">{user?.email}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            {menu && (
              <div role="menu" className="absolute right-0 mt-1 w-52 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                <Link role="menuitem" to={accountPath} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><KeyRound className="h-4 w-4" /> Account &amp; security</Link>
                <button role="menuitem" onClick={signOut} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><LogOut className="h-4 w-4" /> Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
