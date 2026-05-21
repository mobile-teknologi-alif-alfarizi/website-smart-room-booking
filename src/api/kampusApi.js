import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const kampusApi = {
  // Get all kampus
  getAllKampus: async () => {
    try {
      const response = await api.get('/kampus');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single kampus
  getKampus: async (id) => {
    try {
      const response = await api.get(`/kampus/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new kampus
  createKampus: async (data) => {
    try {
      const response = await api.post('/kampus', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update kampus
  updateKampus: async (id, data) => {
    try {
      const response = await api.put(`/kampus/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete kampus
  deleteKampus: async (id) => {
    try {
      const response = await api.delete(`/kampus/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
