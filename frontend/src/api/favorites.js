import { api } from './client';

export const favoritesApi = {
  list: () => api.get('/favorites'),
  add: (petId) => api.post(`/favorites/${petId}`),
  remove: (petId) => api.delete(`/favorites/${petId}`),
};
