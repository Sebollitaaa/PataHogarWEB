const ApiError = require('../utils/ApiError');
const notificationRepository = require('../models/notificationRepository');
const { serialize } = require('../services/notificationService');

async function list(req, res) {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 20;

  const [notifications, total] = await Promise.all([
    notificationRepository.findByUser(req.user.id, { page, pageSize }),
    notificationRepository.countByUser(req.user.id),
  ]);

  res.json({
    notifications: notifications.map(serialize),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

async function unreadCount(req, res) {
  const count = await notificationRepository.countUnread(req.user.id);
  res.json({ count });
}

async function markRead(req, res) {
  const notification = await notificationRepository.findById(req.params.id);
  if (!notification || notification.user_id !== Number(req.user.id)) {
    throw new ApiError(404, 'Notificación no encontrada.');
  }
  await notificationRepository.markRead(notification.id, req.user.id);
  res.json({ message: 'Notificación marcada como leída.' });
}

async function markAllRead(req, res) {
  await notificationRepository.markAllRead(req.user.id);
  res.json({ message: 'Todas las notificaciones marcadas como leídas.' });
}

module.exports = { list, unreadCount, markRead, markAllRead };
