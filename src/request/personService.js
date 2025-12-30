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
    errorHandler(error);
    throw error;
  }
};

export const personService = {
  getPeople: async (params = {}) =>
    apiRequest({
      method: 'get',
      url: 'people',
      params,
    }),

  getPerson: async (id) =>
    apiRequest({
      method: 'get',
      url: `people/${id}`,
    }),

  createPerson: async (personData) =>
    apiRequest({
      method: 'post',
      url: 'people',
      data: personData,
    }),

  updatePerson: async (id, personData) =>
    apiRequest({
      method: 'put',
      url: `people/${id}`,
      data: personData,
    }),

  deletePerson: async (id) =>
    apiRequest({
      method: 'delete',
      url: `people/${id}`,
    }),

  togglePersonStatus: async (id) =>
    apiRequest({
      method: 'patch',
      url: `people/${id}/toggle-status`,
    }),
};
