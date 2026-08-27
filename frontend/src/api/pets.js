import { api } from './client';

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const petsApi = {
  stats: () => api.get('/pets/stats'),
  search: (params) => api.get(`/pets${buildQuery(params)}`),
  getOne: (id) => api.get(`/pets/${id}`),
  create: (formData) => api.post('/pets', formData, { isForm: true }),
  update: (id, payload) => api.patch(`/pets/${id}`, payload),
  updateStatus: (id, status) => api.patch(`/pets/${id}/status`, { status }),
  remove: (id) => api.delete(`/pets/${id}`),
  mine: (status) => api.get(`/pets/mine${buildQuery({ status })}`),
  addPhotos: (id, formData) => api.post(`/pets/${id}/photos`, formData, { isForm: true }),
  deletePhoto: (id, photoId) => api.delete(`/pets/${id}/photos/${photoId}`),
};
