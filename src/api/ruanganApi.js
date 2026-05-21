import axiosInstance from './authApi';

export const ruanganApi = {
  getAllRuangan: async () => {
    return axiosInstance.get('/ruangan');
  },

  getRuangan: async (id) => {
    return axiosInstance.get(`/ruangan/${id}`);
  },

  createRuangan: async (data) => {
    return axiosInstance.post('/ruangan', data);
  },

  updateRuangan: async (id, data) => {
    return axiosInstance.put(`/ruangan/${id}`, data);
  },

  deleteRuangan: async (id) => {
    return axiosInstance.delete(`/ruangan/${id}`);
  },
};
