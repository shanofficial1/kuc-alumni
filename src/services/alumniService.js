import { api, cleanParams } from './api';

const data = (p) => p.then((r) => r.data.data);

export const alumniService = {
  status: () => data(api.get('/alumni/status')),
  getProfile: () => data(api.get('/alumni/profile')).then((d) => d.user),
  updateProfile: (payload) => data(api.patch('/alumni/profile', payload)).then((d) => d.user),
  notifications: (params) => api.get('/alumni/notifications', { params: cleanParams(params) }).then((r) => r.data),
  markRead: (id) => data(api.patch(`/alumni/notifications/${id}/read`, {})),
  markAllRead: () => data(api.patch('/alumni/notifications/read-all', {})),
};
