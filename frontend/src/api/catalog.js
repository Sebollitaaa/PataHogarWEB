import { api } from './client';

export const catalogApi = {
  cities: () => api.get('/cities'),
  searchCities: (q) => api.get(`/cities/search?q=${encodeURIComponent(q)}`),
  species: () => api.get('/species'),
};
