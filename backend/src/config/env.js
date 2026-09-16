require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV !== 'test') {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  // CLIENT_URL puede traer varios orígenes separados por coma (ej. localhost + IP de la red local
  // para probar desde el celular). Se guarda como lista para validar el CORS contra cualquiera de ellos.
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),

  db: {
    host: required('DB_HOST'),
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    database: required('DB_NAME'),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresInDaysRemember: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS_REMEMBER, 10) || 30,
    refreshExpiresInDaysSession: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS_SESSION, 10) || 1,
  },

  locationMismatchBlockKm: parseFloat(process.env.LOCATION_MISMATCH_BLOCK_KM) || 100,
};
