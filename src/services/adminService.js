import { api, cleanParams, downloadFile } from './api';

const data = (p) => p.then((r) => r.data.data);

export const adminService = {
  stats: (months) => data(api.get('/admin/dashboard/stats', { params: { months } })),
  listAlumni: (params) => api.get('/admin/alumni', { params: cleanParams(params) }).then((r) => r.data),
  getAlumni: (id) => data(api.get(`/admin/alumni/${id}`)),
  updateAlumni: (id, payload) => data(api.patch(`/admin/alumni/${id}`, payload)).then((d) => d.user),
  approve: (id) => data(api.patch(`/admin/alumni/${id}/approve`, {})).then((d) => d.user),
  reject: (id, reason) => data(api.patch(`/admin/alumni/${id}/reject`, { reason })).then((d) => d.user),
  setStatus: (id, accountStatus, reason) =>
    data(api.patch(`/admin/alumni/${id}/status`, cleanParams({ accountStatus, reason }))).then((d) => d.user),
  exportFile: (format, params) => downloadFile(`/admin/exports/${format}`, params), // format: 'csv' | 'excel'
  sendNotification: (payload) => data(api.post('/admin/notifications', payload)),
  activityLogs: (params) => api.get('/admin/activity-logs', { params: cleanParams(params) }).then((r) => r.data),
};
