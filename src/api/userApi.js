import axiosInstance from './authApi';

/**
 * User Management API
 * Endpoints untuk CRUD user (Admin only)
 */
export const userApi = {
  /**
   * Get all users
   * @returns {Promise}
   */
  getAllUsers: () => {
    return axiosInstance.get('/users');
  },

  /**
   * Get single user by ID
   * @param {number} id - User ID
   * @returns {Promise}
   */
  getUserById: (id) => {
    return axiosInstance.get(`/users/${id}`);
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @param {string} userData.name - User name
   * @param {string} userData.nomor_induk - Nomor induk (unique)
   * @param {string} userData.password - Password
   * @param {string} userData.password_confirmation - Password confirmation
   * @param {string} userData.role - Role (mahasiswa, dosen, admin)
   * @returns {Promise}
   */
  createUser: (userData) => {
    return axiosInstance.post('/users', userData);
  },

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} userData - User data to update (all fields optional)
   * @param {string} [userData.name] - User name
   * @param {string} [userData.nomor_induk] - Nomor induk
   * @param {string} [userData.password] - Password
   * @param {string} [userData.password_confirmation] - Password confirmation
   * @param {string} [userData.role] - Role
   * @returns {Promise}
   */
  updateUser: (id, userData) => {
    return axiosInstance.put(`/users/${id}`, userData);
  },

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise}
   */
  deleteUser: (id) => {
    return axiosInstance.delete(`/users/${id}`);
  },
};

export default userApi;
