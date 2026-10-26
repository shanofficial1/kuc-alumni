import { api } from './api';

const data = (p) => p.then((r) => r.data.data);
// skipAuthRedirect: these endpoints report auth failures themselves (wrong password, etc.)
const quiet = { skipAuthRedirect: true };

export const authService = {
  register: (payload) => data(api.post('/auth/register', payload, quiet)),
  login: (email, password) => data(api.post('/auth/login', { email, password }, quiet)),
  google: (idToken) => data(api.post('/auth/google', { idToken }, quiet)),
  linkGoogle: (idToken, currentPassword) => data(api.post('/auth/google/link', { idToken, currentPassword }, quiet)),
  logout: () => data(api.post('/auth/logout', undefined, quiet)),
  me: () => data(api.get('/auth/me', quiet)),
  forgotPassword: (email) => data(api.post('/auth/forgot-password', { email }, quiet)),
  resetPassword: (token, password) => data(api.post('/auth/reset-password', { token, password }, quiet)),
  changePassword: (payload) => data(api.post('/auth/change-password', payload, quiet)),
};
