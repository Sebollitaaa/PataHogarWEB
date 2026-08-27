const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

function notFoundHandler(req, res, next) {
  next(new ApiError(404, 'Recurso no encontrado'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = statusCode === 500 && env.nodeEnv === 'production'
    ? 'Ocurrió un error inesperado en el servidor'
    : err.message;

  if (statusCode === 500) {
    logger.error(err);
  }

  res.status(statusCode).json({
    error: {
      message,
      details: err instanceof ApiError ? err.details : undefined,
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
