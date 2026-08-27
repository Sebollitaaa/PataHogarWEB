const db = require('../db/knex');

async function create({ conversation_id, sender_id, content }) {
  const [id] = await db('messages').insert({ conversation_id, sender_id, content });
  return id;
}

function findById(id) {
  return db('messages').where({ id }).first();
}

function findByConversation(conversationId, { beforeId, limit = 30 } = {}) {
  let query = db('messages').where({ conversation_id: conversationId });
  if (beforeId) query = query.where('id', '<', beforeId);
  return query.orderBy('id', 'desc').limit(limit);
}

function markAllRead(conversationId, userId) {
  return db('messages')
    .where({ conversation_id: conversationId })
    .whereNot('sender_id', userId)
    .whereNull('read_at')
    .update({ read_at: db.fn.now() });
}

function unreadCountsForConversations(conversationIds, userId) {
  if (conversationIds.length === 0) return Promise.resolve([]);
  return db('messages')
    .whereIn('conversation_id', conversationIds)
    .whereNot('sender_id', userId)
    .whereNull('read_at')
    .select('conversation_id')
    .count({ count: '*' })
    .groupBy('conversation_id');
}

function lastMessageForConversations(conversationIds) {
  if (conversationIds.length === 0) return Promise.resolve([]);
  return db('messages')
    .whereIn('conversation_id', conversationIds)
    .whereIn('id', function () {
      this.select(db.raw('MAX(id)')).from('messages').whereIn('conversation_id', conversationIds).groupBy('conversation_id');
    });
}

module.exports = { create, findById, findByConversation, markAllRead, unreadCountsForConversations, lastMessageForConversations };
