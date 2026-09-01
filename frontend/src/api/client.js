// En desarrollo (LAN, dos puertos distintos) hace falta la URL completa del backend.
// En producción, el backend sirve el frontend desde el mismo origen, así que alcanza
// con una ruta relativa — ni hay que configurar nada al desplegar.
const API_URL = import.meta.env.VITE_API_URL || '/api';

let accessToken = null;
let onUnauthorized = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

/** El AuthProvider engancha acá qué hacer cuando ni siquiera el refresh token sirve (se cerró la sesión de verdad). */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('refresh_failed');
        const data = await res.json();
        accessToken = data.accessToken;
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Wrapper de fetch: manda el access token, y si vuelve un 401 intenta refrescar
 * la sesión una vez (vía la cookie httpOnly) antes de rendirse.
 */
async function request(path, { method = 'GET', body, isForm = false, retry = true } = {}) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401 && retry && path !== '/auth/refresh') {
    try {
      await refreshAccessToken();
      return request(path, { method, body, isForm, retry: false });
    } catch {
      accessToken = null;
      if (onUnauthorized) onUnauthorized();
      throw new ApiError(401, 'Sesión expirada.');
    }
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message = data?.error?.message || 'Ocurrió un error inesperado.';
    throw new ApiError(res.status, message, data?.error?.details);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  patch: (path, body, opts = {}) => request(path, { method: 'PATCH', body, ...opts }),
  delete: (path, body) => request(path, { method: 'DELETE', body }),
  refreshAccessToken,
};

export { ApiError, API_URL };
