import { api } from './api';

export const metaService = {
  options: () => api.get('/meta/options', { skipAuthRedirect: true }).then((r) => r.data.data),
};
