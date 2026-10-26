/** Where a signed-in user belongs. Frontend routing only; the backend enforces real access. */
export const isAdmin = (user) => user?.role === 'admin';
export const isApproved = (user) => user?.role === 'alumni' && user?.approvalStatus === 'approved';

export function homePath(user) {
  if (!user) return '/login';
  if (isAdmin(user)) return '/admin';
  return isApproved(user) ? '/app/profile' : '/status';
}
