import axiosInstance from './authApi';

export const notificationApi = {
  getMyNotifications: (params = {}) => {
    return axiosInstance.get('/notifications', { params });
  },

  getUnreadCount: () => {
    return axiosInstance.get('/notifications/unread-count');
  },

  markAsRead: (id) => {
    return axiosInstance.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: () => {
    return axiosInstance.patch('/notifications/read-all');
  },

  getAdminNotifications: () => {
    return axiosInstance.get('/notifications/admin');
  },

  sendManualNotification: (data) => {
    return axiosInstance.post('/notifications/manual', data);
  },
};
