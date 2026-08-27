const db = require('../db/knex');

const PUBLIC_COLUMNS = [
  'id', 'first_name', 'last_name', 'email', 'phone', 'profile_photo_url',
  'city_id', 'role', 'status', 'is_verified', 'created_at',
];

function findByEmail(email) {
  return db('users').where({ email: email.toLowerCase() }).first();
}

function findById(id) {
  return db('users').where({ id }).first();
}

function findPublicById(id) {
  return db('users').select(PUBLIC_COLUMNS).where({ id }).first();
}

async function create(user) {
  const [id] = await db('users').insert({ ...user, email: user.email.toLowerCase() });
  return findById(id);
}

function update(id, changes) {
  return db('users').where({ id }).update(changes);
}

module.exports = { findByEmail, findById, findPublicById, create, update, PUBLIC_COLUMNS };
