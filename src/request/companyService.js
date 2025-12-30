import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
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
    const cleanUrl = (url || '').toString().replace(/^\/+/, '');
    const response = await axios({
      method,
      baseURL: API_BASE_URL,
      url: cleanUrl,
      data,
      params,
      headers: { ...buildAuthHeaders() },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const companyService = {
  getCompanies: async (params = {}) =>
    apiRequest({
      method: 'get',
      url: 'companies',
      params,
    }),

  getCompany: async (id) =>
    apiRequest({
      method: 'get',
      url: `companies/${id}`,
    }),

  createCompany: async (companyData) =>
    apiRequest({
      method: 'post',
      url: 'companies',
      data: companyData,
    }),

  updateCompany: async (id, companyData) =>
    apiRequest({
      method: 'put',
      url: `companies/${id}`,
      data: companyData,
    }),

  deleteCompany: async (id) =>
    apiRequest({
      method: 'delete',
      url: `companies/${id}`,
    }),
};
