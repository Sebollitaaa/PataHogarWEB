const ApiError = require('../utils/ApiError');
const tokenService = require('../services/tokenService');
const userRepository = require('../models/userRepository');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'No autenticado.'));
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = tokenService.verifyAccessToken(token);

    // Se chequea el estado actual en base (no solo lo que decía el token) para que
    // un baneo tenga efecto inmediato y no haya que esperar a que expire el access token.
    const user = await userRepository.findById(payload.sub);
    if (!user || user.status === 'banned') {
      return next(new ApiError(401, 'Tu cuenta fue suspendida o ya no existe.'));
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    next(new ApiError(401, 'Sesión inválida o expirada.'));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'No tenés permisos para realizar esta acción.'));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
