import axiosInstance from './authApi';

export const messageApi = {
  getConversations: () => {
    return axiosInstance.get('/messages');
  },

  getConversation: (userId) => {
    return axiosInstance.get(`/messages/conversation/${userId}`);
  },

  getUnreadCount: () => {
    return axiosInstance.get('/messages/unread-count');
  },

  getFollowUpMessages: () => {
    return axiosInstance.get('/messages/follow-up');
  },

  sendMessage: (data) => {
    return axiosInstance.post('/messages/send', data);
  },

  markAsSeen: (messageId) => {
    return axiosInstance.patch(`/messages/${messageId}/seen`);
  },

  markConversationAsSeen: (userId) => {
    return axiosInstance.patch(`/messages/conversation/${userId}/seen-all`);
  },

  deleteMessage: (messageId) => {
    return axiosInstance.delete(`/messages/${messageId}`);
  },
};
