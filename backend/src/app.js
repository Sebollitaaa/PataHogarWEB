const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');

const env = require('./config/env');
const ApiError = require('./utils/ApiError');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiters');
const routes = require('./routes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: env.clientUrls,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Las imágenes se sirven a un origen distinto en desarrollo (el frontend en otro
// puerto/IP), así que relajamos la Cross-Origin-Resource-Policy solo para esta ruta.
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
app.use('/uploads', helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }), express.static(UPLOADS_DIR));

app.use('/api', generalLimiter, routes);

// A partir de acá, cualquier URL que no sea /api ni /uploads es el frontend ya
// compilado (frontend/dist). Esto permite servir todo desde un solo proceso/URL
// en producción, sin tener que lidiar con CORS entre dos sitios distintos.
const FRONTEND_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(FRONTEND_DIST));

app.use('/api', notFoundHandler);

// Cualquier ruta que no matcheó nada de lo anterior (ej. /mascotas/5, /perfil)
// es una ruta del lado del cliente (React Router) — le devolvemos siempre el
// index.html y React decide qué mostrar. Si el build del frontend no existe
// (por ejemplo, corriendo solo el backend en desarrollo), seguimos a errorHandler.
app.use((req, res, next) => {
  if (req.method !== 'GET') return next(new ApiError(404, 'Recurso no encontrado'));
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'), (err) => {
    if (err) next(new ApiError(404, 'Recurso no encontrado'));
  });
});

app.use(errorHandler);

module.exports = app;
