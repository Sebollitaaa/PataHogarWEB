const db = require('../db/knex');

function findById(id) {
  return db('cities').where({ id }).first();
}

function findAll() {
  return db('cities').select('id', 'name', 'province', 'latitude', 'longitude').orderBy('name');
}

module.exports = { findById, findAll };
