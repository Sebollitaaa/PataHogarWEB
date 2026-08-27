const db = require('../db/knex');

function findUserIdsByPet(petId) {
  return db('favorites').where({ pet_id: petId }).pluck('user_id');
}

function add(userId, petId) {
  return db('favorites').insert({ user_id: userId, pet_id: petId }).onConflict(['user_id', 'pet_id']).ignore();
}

function remove(userId, petId) {
  return db('favorites').where({ user_id: userId, pet_id: petId }).del();
}

function findByUser(userId) {
  return db('favorites').where({ user_id: userId }).pluck('pet_id');
}

module.exports = { findUserIdsByPet, add, remove, findByUser };
