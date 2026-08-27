const { Server } = require('socket.io');
const env = require('../config/env');
const logger = require('../utils/logger');
const tokenService = require('../services/tokenService');
const chatService = require('../services/chatService');

function authenticateSocket(socket, next) {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next(new Error('No autenticado.'));

  try {
    const payload = tokenService.verifyAccessToken(token);
    socket.userId = payload.sub;
    next();
  } catch (err) {
    next(new Error('Sesión inválida o expirada.'));
  }
}

function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrls,
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    logger.info(`Socket conectado: usuario ${socket.userId} (${socket.id})`);

    socket.on('message:send', async ({ conversationId, content }, ack) => {
      try {
        const message = await chatService.sendMessage(io, {
          conversationId,
          senderId: socket.userId,
          content,
        });
        if (typeof ack === 'function') ack({ ok: true, message: chatService.serializeMessage(message) });
      } catch (err) {
        logger.warn('Error en message:send:', err.message);
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket desconectado: usuario ${socket.userId} (${socket.id})`);
    });
  });

  return io;
}

module.exports = initSockets;
