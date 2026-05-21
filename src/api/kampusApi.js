import axiosInstance from './authApi';

export const kampusApi = {
  getAllKampus: () => {
    return axiosInstance.get('/kampus');
  },

  getKampus: (id) => {
    return axiosInstance.get(`/kampus/${id}`);
  },

  createKampus: (data) => {
    return axiosInstance.post('/kampus', data);
  },

  updateKampus: (id, data) => {
    return axiosInstance.put(`/kampus/${id}`, data);
  },

  deleteKampus: (id) => {
    return axiosInstance.delete(`/kampus/${id}`);
  },
};
