import { Navigate, Route, Routes } from 'react-router-dom';
import {
  Activity, Bell, LayoutDashboard, Send, UserRound, Users, ClipboardList,
} from 'lucide-react';
import AppShell from './layouts/AppShell';
import { Protected, PublicOnly, RootRedirect } from './routes/guards';
import { isAdmin, isApproved } from './utils/roles';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Account from './pages/shared/Account';
import Notifications from './pages/alumni/Notifications';
import Profile from './pages/alumni/Profile';
import Status from './pages/alumni/Status';
import Dashboard from './pages/admin/Dashboard';
import AlumniList from './pages/admin/AlumniList';
import AlumniDetail from './pages/admin/AlumniDetail';
import SendNotification from './pages/admin/SendNotification';
import ActivityLogs from './pages/admin/ActivityLogs';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/alumni', label: 'Alumni', icon: Users },
  { to: '/admin/notifications', label: 'Send notification', icon: Send },
  { to: '/admin/activity-logs', label: 'Activity log', icon: ClipboardList },
];
const memberNav = [
  { to: '/app/profile', label: 'My profile', icon: UserRound },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
];
const statusNav = [
  { to: '/status', label: 'Registration status', icon: Activity, end: true },
  { to: '/status/notifications', label: 'Notifications', icon: Bell },
];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<PublicOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Administrators */}
      <Route element={<Protected allow={isAdmin} />}>
        <Route element={<AppShell nav={adminNav} accountPath="/admin/account" roleLabel="Administrator" />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/alumni" element={<AlumniList />} />
          <Route path="/admin/alumni/:id" element={<AlumniDetail />} />
          <Route path="/admin/notifications" element={<SendNotification />} />
          <Route path="/admin/activity-logs" element={<ActivityLogs />} />
          <Route path="/admin/account" element={<Account />} />
        </Route>
      </Route>

      {/* Approved alumni */}
      <Route element={<Protected allow={isApproved} />}>
        <Route element={<AppShell nav={memberNav} accountPath="/app/account" bell="/app/notifications" roleLabel="Alumni member" />}>
          <Route path="/app" element={<Navigate to="/app/profile" replace />} />
          <Route path="/app/profile" element={<Profile />} />
          <Route path="/app/notifications" element={<Notifications />} />
          <Route path="/app/account" element={<Account />} />
        </Route>
      </Route>

      {/* Alumni awaiting approval or rejected: backend only allows status, notifications and password change */}
      <Route element={<Protected allow={(u) => u.role === 'alumni' && !isApproved(u)} />}>
        <Route element={<AppShell nav={statusNav} accountPath="/status/account" bell="/status/notifications" roleLabel="Alumni member" />}>
          <Route path="/status" element={<Status />} />
          <Route path="/status/notifications" element={<Notifications />} />
          <Route path="/status/account" element={<Account />} />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
