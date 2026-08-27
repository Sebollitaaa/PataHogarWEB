const db = require('../db/knex');

function normalizePair(idA, idB) {
  const a = Number(idA);
  const b = Number(idB);
  return a < b ? [a, b] : [b, a];
}

function sideOf(conversation, userId) {
  return Number(conversation.user_a_id) === Number(userId) ? 'a' : 'b';
}

async function findOrCreate(petId, userId1, userId2) {
  const [userA, userB] = normalizePair(userId1, userId2);
  let convo = await db('conversations').where({ pet_id: petId, user_a_id: userA, user_b_id: userB }).first();
  if (!convo) {
    const [id] = await db('conversations').insert({ pet_id: petId, user_a_id: userA, user_b_id: userB });
    convo = await db('conversations').where({ id }).first();
  }
  return convo;
}

function findById(id) {
  return db('conversations').where({ id }).first();
}

function isParticipant(conversation, userId) {
  return Number(conversation.user_a_id) === Number(userId) || Number(conversation.user_b_id) === Number(userId);
}

function touchLastMessage(id) {
  return db('conversations').where({ id }).update({ last_message_at: db.fn.now() });
}

/** Cuando le llega un mensaje nuevo, el chat vuelve a aparecer del lado del destinatario aunque lo hubiera archivado o borrado. */
function reviveForRecipient(conversationId, recipientId) {
  return db('conversations').where({ id: conversationId }).first().then((convo) => {
    if (!convo) return;
    const side = sideOf(convo, recipientId);
    const changes = side === 'a' ? { archived_by_a: false, deleted_by_a: false } : { archived_by_b: false, deleted_by_b: false };
    return db('conversations').where({ id: conversationId }).update(changes);
  });
}

function reviveForUser(conversationId, userId) {
  return findById(conversationId).then((convo) => {
    const side = sideOf(convo, userId);
    const changes = side === 'a' ? { archived_by_a: false, deleted_by_a: false } : { archived_by_b: false, deleted_by_b: false };
    return db('conversations').where({ id: conversationId }).update(changes);
  });
}

function setArchived(conversationId, userId, archived) {
  return findById(conversationId).then((convo) => {
    const side = sideOf(convo, userId);
    const changes = side === 'a' ? { archived_by_a: archived } : { archived_by_b: archived };
    return db('conversations').where({ id: conversationId }).update(changes);
  });
}

function setDeleted(conversationId, userId) {
  return findById(conversationId).then((convo) => {
    const side = sideOf(convo, userId);
    const changes = side === 'a' ? { deleted_by_a: true } : { deleted_by_b: true };
    return db('conversations').where({ id: conversationId }).update(changes);
  });
}

async function listForUser(userId) {
  const rows = await db('conversations')
    .join('pets', 'pets.id', 'conversations.pet_id')
    .select('conversations.*', 'pets.name as pet_name', 'pets.status as pet_status')
    .where((builder) => {
      builder.where('conversations.user_a_id', userId).andWhere('conversations.deleted_by_a', false);
    })
    .orWhere((builder) => {
      builder.where('conversations.user_b_id', userId).andWhere('conversations.deleted_by_b', false);
    })
    .orderBy('conversations.last_message_at', 'desc');

  return rows;
}

module.exports = {
  findOrCreate,
  findById,
  isParticipant,
  sideOf,
  touchLastMessage,
  reviveForRecipient,
  reviveForUser,
  setArchived,
  setDeleted,
  listForUser,
};
