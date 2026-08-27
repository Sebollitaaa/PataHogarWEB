const ApiError = require('../utils/ApiError');
const db = require('../db/knex');
const userRepository = require('../models/userRepository');
const refreshTokenRepository = require('../models/refreshTokenRepository');
const adminActionRepository = require('../models/adminActionRepository');
const petRepository = require('../models/petRepository');
const imageService = require('../services/imageService');

async function listUsers(req, res) {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 30;

  let query = db('users').select(userRepository.PUBLIC_COLUMNS);
  if (req.query.q) {
    const q = `%${req.query.q}%`;
    query = query.where((b) => {
      b.where('email', 'like', q).orWhere('first_name', 'like', q).orWhere('last_name', 'like', q);
    });
  }

  const users = await query.clone().orderBy('created_at', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  const totalRow = await db.count('* as count').from(query.clone().clearOrder().as('sub')).first();

  res.json({ users, pagination: { page, pageSize, total: Number(totalRow.count) } });
}

async function banUser(req, res) {
  const targetId = Number(req.params.id);
  if (targetId === Number(req.user.id)) throw new ApiError(400, 'No podés banearte a vos mismo.');

  const user = await userRepository.findById(targetId);
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');

  await userRepository.update(targetId, { status: 'banned' });
  await refreshTokenRepository.revokeAllForUser(targetId);
  await adminActionRepository.create({
    admin_id: req.user.id,
    action_type: 'ban_user',
    target_type: 'user',
    target_id: targetId,
    reason: req.body.reason || null,
  });

  res.json({ message: 'Usuario suspendido.' });
}

async function unbanUser(req, res) {
  const targetId = Number(req.params.id);
  const user = await userRepository.findById(targetId);
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');

  await userRepository.update(targetId, { status: 'active' });
  res.json({ message: 'Usuario reactivado.' });
}

async function deleteUser(req, res) {
  const targetId = Number(req.params.id);
  if (targetId === Number(req.user.id)) throw new ApiError(400, 'No podés eliminar tu propia cuenta desde acá.');

  const user = await userRepository.findById(targetId);
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');

  const ownedPets = await db('pets').where({ owner_id: targetId }).select('id');

  await adminActionRepository.create({
    admin_id: req.user.id,
    action_type: 'delete_user',
    target_type: 'user',
    target_id: targetId,
    reason: req.body.reason || null,
  });

  // El admin_action queda registrado antes de borrar; el usuario se elimina en cascada
  // (sus publicaciones, favoritos, conversaciones y refresh tokens caen con él).
  await db('users').where({ id: targetId }).del();

  for (const pet of ownedPets) {
    await imageService.deleteEntityImages('pets', pet.id);
  }

  res.json({ message: 'Usuario eliminado.' });
}

async function listActions(req, res) {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const actions = await adminActionRepository.findAll({ page, pageSize: 30 });
  res.json({ actions });
}

module.exports = { listUsers, banUser, unbanUser, deleteUser, listActions };
