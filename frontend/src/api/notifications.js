import { api } from './client';

export const notificationsApi = {
  list: (page = 1) => api.get(`/notifications?page=${page}`),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
