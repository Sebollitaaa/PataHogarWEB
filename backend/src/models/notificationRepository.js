const db = require('../db/knex');

function create(entry) {
  return db('notifications').insert({ ...entry, payload: JSON.stringify(entry.payload) }).then(([id]) => id);
}

function findById(id) {
  return db('notifications').where({ id }).first();
}

function findByUser(userId, { page = 1, pageSize = 20 } = {}) {
  return db('notifications')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc')
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

async function countByUser(userId) {
  const row = await db('notifications').where({ user_id: userId }).count({ count: '*' }).first();
  return Number(row.count);
}

async function countUnread(userId) {
  const row = await db('notifications').where({ user_id: userId, is_read: false }).count({ count: '*' }).first();
  return Number(row.count);
}

function markRead(id, userId) {
  return db('notifications').where({ id, user_id: userId }).update({ is_read: true });
}

function markAllRead(userId) {
  return db('notifications').where({ user_id: userId, is_read: false }).update({ is_read: true });
}

module.exports = { create, findById, findByUser, countByUser, countUnread, markRead, markAllRead };
