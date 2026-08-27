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

  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'PataHogar <no-reply@patahogar.com>',
  },

  verificationCodeExpiresMin: parseInt(process.env.VERIFICATION_CODE_EXPIRES_MIN, 10) || 15,
  locationMismatchBlockKm: parseFloat(process.env.LOCATION_MISMATCH_BLOCK_KM) || 100,

  // Restricción opcional de registro solo a Gmail (ver validators/authValidators.js). Apagada por defecto.
  allowOnlyGmailRegistration: (process.env.ALLOW_ONLY_GMAIL_REGISTRATION ?? 'false') === 'true',

  // Mientras el envío de emails no esté 100% resuelto (dominio propio verificado en Resend),
  // esto permite registrarse con cualquier email y quedar verificado al toque, sin código.
  // Apagar (poner en 'false') antes de ir a producción real.
  skipEmailVerification: (process.env.SKIP_EMAIL_VERIFICATION ?? 'false') === 'true',
};
