const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');

const env = require('./config/env');
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

// Las imágenes se sirven a un origen distinto (el frontend en otro puerto/dominio),
// así que relajamos la Cross-Origin-Resource-Policy solo para esta ruta estática.
app.use('/uploads', helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }), express.static('uploads'));

app.use('/api', generalLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
