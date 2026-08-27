const http = require('http');
const app = require('./app');
const initSockets = require('./sockets');
const env = require('./config/env');
const logger = require('./utils/logger');

const httpServer = http.createServer(app);
const io = initSockets(httpServer);
app.set('io', io);

httpServer.listen(env.port, () => {
  logger.info(`PataHogar backend escuchando en el puerto ${env.port} (${env.nodeEnv})`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
