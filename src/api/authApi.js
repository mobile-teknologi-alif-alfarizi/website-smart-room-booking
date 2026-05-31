import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
axiosInstance.interceptors.request.use(
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

// Add response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authApi = {
  /**
   * Login user
   * @param {string} nomor_induk - Nomor induk user
   * @param {string} password - Password user
   * @returns {Promise}
   */
  login: (nomor_induk, password) => {
    return axiosInstance.post('/auth/login', {
      nomor_induk,
      password,
    });
  },

  /**
   * Get authenticated user profile
   * @returns {Promise}
   */
  getProfile: () => {
    return axiosInstance.get('/auth/me');
  },

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: () => {
    return axiosInstance.post('/auth/logout');
  },

  /**
   * Refresh JWT token
   * @returns {Promise}
   */
  refreshToken: () => {
    return axiosInstance.post('/auth/refresh');
  },
};

export default axiosInstance;
