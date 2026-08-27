const db = require('../db/knex');

function create(entry) {
  return db('refresh_tokens').insert(entry);
}

function findActiveByHash(tokenHash) {
  return db('refresh_tokens')
    .where({ token_hash: tokenHash })
    .whereNull('revoked_at')
    .where('expires_at', '>', db.fn.now())
    .first();
}

function revoke(id) {
  return db('refresh_tokens').where({ id }).update({ revoked_at: db.fn.now() });
}

function revokeAllForUser(userId) {
  return db('refresh_tokens').where({ user_id: userId }).whereNull('revoked_at').update({ revoked_at: db.fn.now() });
}

module.exports = { create, findActiveByHash, revoke, revokeAllForUser };
