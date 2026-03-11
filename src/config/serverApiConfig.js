const isProd = !!import.meta.env.PROD;
const isRemote = isProd;
const rawBackendServer = (import.meta.env.VITE_BACKEND_SERVER || '').trim();
const stripWrappingQuotes = (value = '') =>
  value
    .toString()
    .trim()
    .replace(/^['"]|['"]$/g, '');

const normalizeBackend = (value) => {
  const cleaned = stripWrappingQuotes(value || '');
  if (!cleaned) return '';
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned.replace(/\/+$/, '');
  }
  const withLeading = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  return withLeading.replace(/\/+$/, '');
};

const hasApiPath = (value = '') => /\/api(?:\/|$)/i.test(value);
const toApiBase = (value = '') => {
  const normalized = normalizeBackend(value);
  if (!normalized) return '/api/';
  if (hasApiPath(normalized)) return `${normalized}/`;
  return `${normalized}/api/`;
};

const backendServer = normalizeBackend(rawBackendServer);
const backendHasApi = hasApiPath(backendServer);
const backendRoot = backendHasApi ? backendServer.replace(/\/api$/i, '') : backendServer;
const backendApi = toApiBase(backendServer);

const devBackendServer = normalizeBackend(rawBackendServer || 'http://localhost:8888');
const devBackendHasApi = hasApiPath(devBackendServer);
const devBackendApi = toApiBase(devBackendServer);
const devBackendRoot = devBackendHasApi
  ? devBackendServer.replace(/\/api$/i, '')
  : devBackendServer;

const localBase = devBackendRoot ? `${devBackendRoot}/` : '/';
const localDownloadBase = devBackendRoot ? `${devBackendRoot}/download/` : '/download/';

export const API_BASE_URL = isRemote ? backendApi : devBackendApi;
export const BASE_URL = isRemote ? (backendRoot ? `${backendRoot}/` : '/') : localBase;

export const WEBSITE_URL = import.meta.env.PROD
  ? 'http://cloud.idurarapp.com/'
  : 'http://localhost:3000/';
export const DOWNLOAD_BASE_URL =
  isRemote
    ? (backendRoot ? `${backendRoot}/download/` : '/download/')
    : localDownloadBase;
export const ACCESS_TOKEN_NAME = 'x-auth-token';

export const FILE_BASE_URL = stripWrappingQuotes(import.meta.env.VITE_FILE_BASE_URL || '');
export const REPORT_BASE_URL = import.meta.env.VITE_REPORT_SERVER || '/ssrs/';

//  console.log(
//    '🚀 Welcome to IDURAR ERP CRM! Did you know that we also offer commercial customization services? Contact us at hello@idurarapp.com for more information.'
//  );
