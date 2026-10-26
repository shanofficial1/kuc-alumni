export const formatDate = (v) =>
  v ? new Date(v).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export const formatDateTime = (v) =>
  v ? new Date(v).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const categoryLabel = (c) => ({ indian: 'Indian', nri: 'NRI' }[c] || c || '—');
export const batchLabel = (u) => (u?.academicYearStart ? `${u.academicYearStart}–${u.academicYearEnd}` : '—');
export const phoneLabel = (u) => (u?.phoneNumber ? `${u.phoneCountryCode} ${u.phoneNumber}` : '—');
export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Audit actions exposed by the backend (constants.js AUDIT_ACTIONS / docs/API.md)
export const AUDIT_ACTIONS = [
  'alumni.approve', 'alumni.reject', 'alumni.status_change', 'alumni.profile_update',
  'notification.send', 'export.csv', 'export.excel', 'admin.bootstrap',
];
export const NOTIFICATION_TYPES = ['account', 'approval', 'rejection', 'announcement'];

export const EXPORT_PRESETS = [
  { value: 'filtered', label: 'Current filters' },
  { value: 'all', label: 'All alumni' },
  { value: 'approved', label: 'Approved only' },
  { value: 'pending', label: 'Pending only' },
  { value: 'rejected', label: 'Rejected only' },
  { value: 'indian', label: 'Indian category' },
  { value: 'nri', label: 'NRI category' },
];
