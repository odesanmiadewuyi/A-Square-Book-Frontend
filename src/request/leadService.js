import axios from 'axios';
import { API_BASE_URL, BASE_URL } from '@/config/serverApiConfig';
import errorHandler from '@/request/errorHandler';
import storePersist from '@/redux/storePersist';

const buildAuthHeaders = () => {
  const auth = storePersist.get('auth');
  if (auth?.current?.token) {
    return { Authorization: `Bearer ${auth.current.token}` };
  }
  return {};
};

const apiRequest = async ({ method, url, data, params }) => {
  try {
    const base = (API_BASE_URL || '').toString();
    const normalizedBase = base.startsWith('http') ? (base.endsWith('/') ? base.slice(0, -1) : base) : (base.startsWith('/') ? base.replace(/\/$/, '') : '/' + base.replace(/\/$/, ''));
    const path = (url || '').toString();
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    const baseOrigin = (BASE_URL && BASE_URL !== '/') ? BASE_URL.replace(/\/$/, '') : window.location.origin;
    const fullUrl = (normalizedBase.startsWith('http') ? normalizedBase : baseOrigin + normalizedBase) + normalizedPath;
    const response = await axios({
      method,
      url: fullUrl,
      data,
      params,
      headers: { ...buildAuthHeaders() },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    errorHandler(error);
    throw error;
  }
};

export const leadService = {
  getLeads: async (params = {}) =>
    apiRequest({
      method: 'get',
      url: 'leads',
      params,
    }),

  getLead: async (id) =>
    apiRequest({
      method: 'get',
      url: `leads/${id}`,
    }),

  createLead: async (leadData) =>
    apiRequest({
      method: 'post',
      url: 'leads',
      data: leadData,
    }),

  updateLead: async (id, leadData) =>
    apiRequest({
      method: 'put',
      url: `leads/${id}`,
      data: leadData,
    }),

  deleteLead: async (id) =>
    apiRequest({
      method: 'delete',
      url: `leads/${id}`,
    }),
};
