import { api } from './client';

export const conversationsApi = {
  list: () => api.get('/conversations'),
  start: (petId, content) => api.post('/conversations', { petId, content }),
  messages: (conversationId, beforeId) => api.get(`/conversations/${conversationId}/messages${beforeId ? `?beforeId=${beforeId}` : ''}`),
  send: (conversationId, content) => api.post(`/conversations/${conversationId}/messages`, { content }),
  archive: (conversationId, archived) => api.patch(`/conversations/${conversationId}/archive`, { archived }),
  remove: (conversationId) => api.delete(`/conversations/${conversationId}`),
};
