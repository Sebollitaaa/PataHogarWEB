const db = require('../db/knex');

function create(entry) {
  return db('admin_actions').insert(entry);
}

function findAll({ page = 1, pageSize = 30 } = {}) {
  return db('admin_actions')
    .join('users', 'users.id', 'admin_actions.admin_id')
    .select('admin_actions.*', 'users.first_name as admin_first_name', 'users.last_name as admin_last_name')
    .orderBy('admin_actions.created_at', 'desc')
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

module.exports = { create, findAll };
