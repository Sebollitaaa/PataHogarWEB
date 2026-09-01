// El origen del backend (para armar URLs de imágenes y conectar el socket).
// En desarrollo (LAN, dos puertos) hace falta la URL completa.
// En producción, el backend sirve el frontend desde el mismo origen: dejamos
// todo vacío/undefined y tanto las URLs de imágenes (relativas) como
// socket.io-client (que sin URL se conecta solo al origen de la página)
// funcionan sin configurar nada.
export const API_ORIGIN = import.meta.env.VITE_SOCKET_URL || '';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;
