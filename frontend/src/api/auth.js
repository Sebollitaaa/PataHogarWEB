import { api } from './client';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  verifyEmail: (payload) => api.post('/auth/verify-email', payload),
  resendCode: (email) => api.post('/auth/resend-code', { email }),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  me: () => api.get('/auth/me'),
};
