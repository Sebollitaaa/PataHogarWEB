const notificationRepository = require('../models/notificationRepository');

function serialize(n) {
  return {
    id: n.id,
    type: n.type,
    payload: typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload,
    isRead: Boolean(n.is_read),
    createdAt: n.created_at,
  };
}

async function create(io, entry) {
  const id = await notificationRepository.create(entry);
  const notification = await notificationRepository.findById(id);

  if (io) {
    io.to(`user:${entry.user_id}`).emit('notification:new', serialize(notification));
  }

  return notification;
}

module.exports = { create, serialize };
