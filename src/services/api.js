import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) console.error('VITE_API_BASE_URL is not set. Copy .env.example to .env and restart the dev server.');

export const api = axios.create({ baseURL, withCredentials: true, timeout: 30000 });

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/* ---------- CSRF (double-submit token, see backend middleware/csrf.js) ---------- */
let csrfToken = null;
let csrfPending = null;

export function fetchCsrf(force = false) {
  if (csrfToken && !force) return Promise.resolve(csrfToken);
  if (!csrfPending) {
    csrfPending = api
      .get('/auth/csrf', { skipAuthRedirect: true })
      .then((res) => {
        csrfToken = res.data.data.csrfToken;
        return csrfToken;
      })
      .finally(() => { csrfPending = null; });
  }
  return csrfPending;
}

/* ---------- Errors ---------- */
export class ApiError extends Error {
  constructor({ status, code, message, details, requestId }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    // Validation details look like [{ in, path, message }] -> { path: message }
    this.fieldErrors = {};
    if (Array.isArray(details)) {
      details.forEach((d) => { if (d?.path && !this.fieldErrors[d.path]) this.fieldErrors[d.path] = d.message; });
    }
  }
}

function toApiError(error) {
  const body = error.response?.data?.error;
  if (body) return new ApiError({ status: error.response.status, ...body });
  if (error.response) {
    return new ApiError({ status: error.response.status, code: 'HTTP_ERROR', message: `Request failed (${error.response.status})` });
  }
  return new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'Cannot reach the server. Check your connection and the API address.' });
}

/* ---------- Interceptors ---------- */
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => { unauthorizedHandler = fn; };

api.interceptors.request.use(async (config) => {
  if (!SAFE_METHODS.includes((config.method || 'get').toUpperCase())) {
    config.headers['X-CSRF-Token'] = await fetchCsrf();
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const res = error.response;
    // Export downloads use responseType "blob"; decode JSON error bodies so messages still surface.
    if (res?.data instanceof Blob) {
      try { res.data = JSON.parse(await res.data.text()); } catch { res.data = null; }
    }
    const code = res?.data?.error?.code;
    const config = error.config;

    // Stale or missing CSRF token: fetch a fresh one and retry once.
    if (res?.status === 403 && code === 'CSRF_INVALID' && config && !config._csrfRetried) {
      config._csrfRetried = true;
      config.headers['X-CSRF-Token'] = await fetchCsrf(true);
      return api(config);
    }
    // Session ended (expired, revoked, or account suspended) while using the app.
    if (config && !config.skipAuthRedirect && (code === 'UNAUTHENTICATED' || code === 'ACCOUNT_SUSPENDED')) {
      unauthorizedHandler?.(code, res.data.error.message);
    }
    return Promise.reject(toApiError(error));
  },
);

/** Removes empty values so optional query params are omitted rather than sent as "". */
export const cleanParams = (obj = {}) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null));

/** GET a file (export) and trigger a browser download. Returns { filename, rowCount }. */
export async function downloadFile(path, params) {
  const res = await api.get(path, { params: cleanParams(params), responseType: 'blob', timeout: 120000 });
  const disposition = res.headers['content-disposition'] || '';
  const filename = /filename="?([^";]+)"?/i.exec(disposition)?.[1] || 'export';
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return { filename, rowCount: Number(res.headers['x-export-row-count']) };
}
