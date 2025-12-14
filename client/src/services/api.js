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
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(` API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(` API Error: ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.error(' Unauthorized - Token may be expired');
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
      console.log('Calling Occupancy API with:', params);
      const response = await api.post(API_ENDPOINTS.ANALYTICS.OCCUPANCY, params);
      return response.data;
    } catch (error) {
      console.error(" Occupancy API Error:", error);
      throw error;
    }
  },

  getFootfall: async (params) => {
    try {
      console.log('Calling Footfall API with:', params);
      const response = await api.post(API_ENDPOINTS.ANALYTICS.FOOTFALL, params);
      return response.data;
    } catch (error) {
      console.error(" Footfall API Error:", error);
      throw error;
    }
  },

  getDwellTime: async (params) => {
    try {
      console.log('Calling Dwell Time API with:', params);
      const response = await api.post(API_ENDPOINTS.ANALYTICS.DWELL, params);
      return response.data;
    } catch (error) {
      console.error(" Dwell Time API Error:", error);
      throw error;
    }
  },

  getDemographics: async (params) => {
    try {
      console.log('🔵 Calling Demographics API with:', params);
      const response = await api.post(API_ENDPOINTS.ANALYTICS.DEMOGRAPHICS, params);
      return response.data;
    } catch (error) {
      console.error("Demographics API Error:", error);
      throw error;
    }
  },

  getEntryExit: async (params) => {
    try {
      console.log('Calling Entry/Exit API with:', params);
      const response = await api.post(API_ENDPOINTS.ANALYTICS.ENTRY_EXIT, params);
      return response.data;
    } catch (error) {
      console.error("Entry/Exit API Error:", error);
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
      console.error("Error fetching all sites:", error);
      throw error.response?.data || { message: 'Failed to fetch sites' };
    }
  },

  getSiteById: async (siteId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.ALL.GETALL}/${siteId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching site by ID:", error);
      throw error.response?.data || { message: 'Failed to fetch site' };
    }
  },
}
export default api;