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

// Límite estricto para pedidos de códigos (verificación de email / recuperación de contraseña).
const codeRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Ya pediste varios códigos. Esperá unos minutos antes de volver a intentar.' } },
});

module.exports = { generalLimiter, loginLimiter, codeRequestLimiter };
