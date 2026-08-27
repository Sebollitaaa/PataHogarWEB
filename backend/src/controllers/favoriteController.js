const ApiError = require('../utils/ApiError');
const favoriteRepository = require('../models/favoriteRepository');
const petRepository = require('../models/petRepository');
const { serializePet, groupPhotosByPet } = require('./petController');

async function add(req, res) {
  const pet = await petRepository.findById(req.params.petId);
  if (!pet) throw new ApiError(404, 'Publicación no encontrada.');

  await favoriteRepository.add(req.user.id, pet.id);
  res.status(201).json({ message: 'Agregado a favoritos.' });
}

async function remove(req, res) {
  await favoriteRepository.remove(req.user.id, req.params.petId);
  res.json({ message: 'Quitado de favoritos.' });
}

async function listMine(req, res) {
  const petIds = await favoriteRepository.findByUser(req.user.id);
  if (petIds.length === 0) return res.json({ pets: [] });

  const pets = await Promise.all(petIds.map((id) => petRepository.findById(id)));
  const validPets = pets.filter(Boolean);
  const photos = await petRepository.findPhotosForPets(validPets.map((p) => p.id));
  const photosByPet = groupPhotosByPet(photos);

  res.json({ pets: validPets.map((p) => serializePet(p, photosByPet[p.id] || [])) });
}

module.exports = { add, remove, listMine };
