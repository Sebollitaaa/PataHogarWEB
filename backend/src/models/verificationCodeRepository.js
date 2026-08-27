const db = require('../db/knex');

function create(entry) {
  return db('verification_codes').insert(entry);
}

function findLatestActive(userId, type) {
  return db('verification_codes')
    .where({ user_id: userId, type })
    .whereNull('used_at')
    .where('expires_at', '>', db.fn.now())
    .orderBy('created_at', 'desc')
    .first();
}

function invalidateActive(userId, type) {
  return db('verification_codes')
    .where({ user_id: userId, type })
    .whereNull('used_at')
    .update({ used_at: db.fn.now() });
}

function incrementAttempts(id) {
  return db('verification_codes').where({ id }).increment('attempts', 1);
}

function markUsed(id) {
  return db('verification_codes').where({ id }).update({ used_at: db.fn.now() });
}

module.exports = { create, findLatestActive, invalidateActive, incrementAttempts, markUsed };
