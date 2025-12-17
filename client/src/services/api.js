import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {

    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {

    return response;
  },
  (error) => {
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },
};

// Analytics APIs
export const analyticsAPI = {
  getOccupancy: async (params) => {
    try {

      const response = await api.post(API_ENDPOINTS.ANALYTICS.OCCUPANCY, params);
      return response.data;
    } catch (error) {

      throw error;
    }
  },

  getFootfall: async (params) => {
    try {

      const response = await api.post(API_ENDPOINTS.ANALYTICS.FOOTFALL, params);
      return response.data;
    } catch (error) {

      throw error;
    }
  },

  getDwellTime: async (params) => {
    try {

      const response = await api.post(API_ENDPOINTS.ANALYTICS.DWELL, params);
      return response.data;
    } catch (error) {

      throw error;
    }
  },

  getDemographics: async (params) => {
    try {

      const response = await api.post(API_ENDPOINTS.ANALYTICS.DEMOGRAPHICS, params);
      return response.data;
    } catch (error) {

      throw error;
    }
  },

  getEntryExit: async (params) => {
    try {

      const response = await api.post(API_ENDPOINTS.ANALYTICS.ENTRY_EXIT, params);
      return response.data;
    } catch (error) {

      throw error;
    }
  },
};

export const allSitesAPI =  {
  getAllSites: async () =>{
    try {
      const response = await api.get(API_ENDPOINTS.ALL.GETALL);
      return response;
    } catch (error) {

      throw error.response?.data || { message: 'Failed to fetch sites' };
    }
  },

  getSiteById: async (siteId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.ALL.GETALL}/${siteId}`);
      return response.data;
    } catch (error) {

      throw error.response?.data || { message: 'Failed to fetch site' };
    }
  },
}
export default api;