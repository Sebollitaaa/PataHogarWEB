const rateLimit = require('express-rate-limit');

// Límite general para toda la API, evita abuso básico.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Demasiadas solicitudes, probá de nuevo más tarde.' } },
});

// Límite estricto para login: evita fuerza bruta de contraseñas.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: { message: 'Demasiados intentos de inicio de sesión. Esperá unos minutos.' } },
});

module.exports = { generalLimiter, loginLimiter };
