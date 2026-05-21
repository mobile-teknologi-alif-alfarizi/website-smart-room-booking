import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ruanganApi = {
  getAllRuangan: async () => {
    return api.get('/ruangan');
  },

  getRuangan: async (id) => {
    return api.get(`/ruangan/${id}`);
  },

  createRuangan: async (data) => {
    return api.post('/ruangan', data);
  },

  updateRuangan: async (id, data) => {
    return api.put(`/ruangan/${id}`, data);
  },

  deleteRuangan: async (id) => {
    return api.delete(`/ruangan/${id}`);
  },
};
