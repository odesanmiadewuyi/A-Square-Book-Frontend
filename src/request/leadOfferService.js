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
    const response = await axios({
      method,
      url: `${API_BASE_URL}${url}`,
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

export const leadOfferService = {
  getLeadOffers: async (params = {}) =>
    apiRequest({
      method: 'get',
      url: 'lead-offers/list',
      params,
    }),

  getLeadOffer: async (id) =>
    apiRequest({
      method: 'get',
      url: `lead-offers/read/${id}`,
    }),

  createLeadOffer: async (data) =>
    apiRequest({
      method: 'post',
      url: 'lead-offers/create',
      data,
    }),

  updateLeadOffer: async (id, data) =>
    apiRequest({
      method: 'patch',
      url: `lead-offers/update/${id}`,
      data,
    }),

  deleteLeadOffer: async (id) =>
    apiRequest({
      method: 'delete',
      url: `lead-offers/delete/${id}`,
    }),
};
