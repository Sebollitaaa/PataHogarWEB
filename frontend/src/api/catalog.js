import { api } from './client';

export const catalogApi = {
  cities: () => api.get('/cities'),
  species: () => api.get('/species'),
};
