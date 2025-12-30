// In dev, use Vite proxy by default to avoid hard-coded ports
const isRemote = import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE == 'remote';
const rawBackendServer = (import.meta.env.VITE_BACKEND_SERVER || '').trim();
const normalizeBackend = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) {
    return value.replace(/\/+$/, '');
  }
  const withLeading = value.startsWith('/') ? value : `/${value}`;
  return withLeading.replace(/\/+$/, '');
};
const backendServer = normalizeBackend(rawBackendServer);
const backendHasApi = /\/api$/i.test(backendServer);
const backendRoot = backendHasApi ? backendServer.replace(/\/api$/i, '') : backendServer;
const backendApi = backendHasApi
  ? `${backendServer}/`
  : backendServer
    ? `${backendServer}/api/`
    : '/api/';

const localApi = (() => {
  if (typeof window === 'undefined') return '/api/';
  return `${window.location.origin}/api/`;
})();

export const API_BASE_URL = isRemote ? backendApi : localApi;
export const BASE_URL = isRemote ? (backendRoot ? `${backendRoot}/` : '/') : '/';

export const WEBSITE_URL = import.meta.env.PROD
  ? 'http://cloud.idurarapp.com/'
  : 'http://localhost:3000/';
export const DOWNLOAD_BASE_URL =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE
    ? import.meta.env.VITE_BACKEND_SERVER + 'download/'
    : '/download/';
export const ACCESS_TOKEN_NAME = 'x-auth-token';

export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL;
export const REPORT_BASE_URL = import.meta.env.VITE_REPORT_SERVER || '/ssrs/';

//  console.log(
//    '🚀 Welcome to IDURAR ERP CRM! Did you know that we also offer commercial customization services? Contact us at hello@idurarapp.com for more information.'
//  );
