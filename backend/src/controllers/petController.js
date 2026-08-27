const ApiError = require('../utils/ApiError');
const petRepository = require('../models/petRepository');
const userRepository = require('../models/userRepository');
const favoriteRepository = require('../models/favoriteRepository');
const notificationService = require('../services/notificationService');
const adminActionRepository = require('../models/adminActionRepository');
const locationService = require('../services/locationService');
const imageService = require('../services/imageService');
const { computeAgeFromBirthDate } = require('../utils/age');

const MAX_PHOTOS = 10;

function toBool(v) {
  return v === true || v === 'true' || v === '1' || v === 1;
}

/**
 * A partir de lo que mandó el formulario (fecha de nacimiento o edad a mano),
 * arma las columnas de edad a guardar. En modo "manual" se guarda tal cual lo
 * escribió el dueño, sin normalizar (si puso 45 días, quedan 45 días, no "1 mes y 15 días").
 * En modo "birth_date" se guarda la fecha y una foto de la edad actual, que después
 * se recalcula en vivo cada vez que se muestra la publicación (ver serializePet).
 */
function buildAgeFields(b) {
  if (b.ageMode === 'birth_date') {
    const { years, months, days } = computeAgeFromBirthDate(b.birthDate);
    return {
      age_mode: 'birth_date',
      birth_date: b.birthDate,
      age_years: years,
      age_months: months,
      age_days: days,
    };
  }

  return {
    age_mode: 'manual',
    birth_date: null,
    age_years: b.ageYears || 0,
    age_months: b.ageMonths || 0,
    age_days: b.ageDays || 0,
  };
}

function serializePet(pet, photos = []) {
  // Si la edad se cargó por fecha de nacimiento, se recalcula al momento de mostrarla
  // para que siempre sea la edad real de hoy, no una foto vieja de cuando se publicó.
  const age = pet.age_mode === 'birth_date' && pet.birth_date
    ? computeAgeFromBirthDate(pet.birth_date)
    : { years: pet.age_years, months: pet.age_months, days: pet.age_days };

  return {
    id: pet.id,
    name: pet.name,
    species: { id: pet.species_id, name: pet.species_name, slug: pet.species_slug },
    breed: pet.breed,
    size: pet.size,
    ageMode: pet.age_mode,
    birthDate: pet.birth_date,
    ageYears: age.years,
    ageMonths: age.months,
    ageDays: age.days,
    sex: pet.sex,
    isVaccinated: Boolean(pet.is_vaccinated),
    isNeutered: Boolean(pet.is_neutered),
    isDewormed: Boolean(pet.is_dewormed),
    description: pet.description,
    status: pet.status,
    latitude: Number(pet.latitude),
    longitude: Number(pet.longitude),
    contactWhatsapp: pet.contact_whatsapp,
    contactEmail: pet.contact_email,
    owner: { id: pet.owner_id, firstName: pet.owner_first_name, lastName: pet.owner_last_name },
    photos: photos.map((p) => ({ id: p.id, thumbnail: p.url_thumbnail, medium: p.url_medium, original: p.url_original })),
    distanceKm: pet.distance_km !== undefined ? Number(pet.distance_km) : undefined,
    createdAt: pet.created_at,
  };
}

async function assertOwnerOrAdmin(pet, user) {
  if (pet.owner_id !== Number(user.id) && user.role !== 'admin') {
    throw new ApiError(403, 'No podés modificar una publicación que no es tuya.');
  }
}

async function create(req, res) {
  const files = req.files || [];
  if (files.length < 1) throw new ApiError(422, 'Subí al menos una foto de la mascota.');
  if (files.length > MAX_PHOTOS) throw new ApiError(422, `Podés subir hasta ${MAX_PHOTOS} fotos.`);

  const user = await userRepository.findById(req.user.id);
  const { lat, lng } = await locationService.getEffectiveUserLocation(user);

  const b = req.body;
  const petId = await petRepository.create({
    owner_id: user.id,
    species_id: b.speciesId,
    name: b.name,
    breed: b.breed || null,
    size: b.size,
    ...buildAgeFields(b),
    sex: b.sex,
    is_vaccinated: toBool(b.isVaccinated),
    is_neutered: toBool(b.isNeutered),
    is_dewormed: toBool(b.isDewormed),
    description: b.description,
    contact_whatsapp: b.contactWhatsapp || null,
    contact_email: b.contactEmail || null,
    latitude: lat,
    longitude: lng,
  });

  let sortOrder = 0;
  for (const file of files) {
    const urls = await imageService.processImage(file.buffer, 'pets', petId);
    await petRepository.addPhoto({
      pet_id: petId,
      url_original: urls.original,
      url_medium: urls.medium,
      url_thumbnail: urls.thumbnail,
      sort_order: sortOrder++,
    });
  }

  const pet = await petRepository.findById(petId);
  const photos = await petRepository.findPhotos(petId);
  res.status(201).json({ pet: serializePet(pet, photos) });
}

async function getOne(req, res) {
  const pet = await petRepository.findById(req.params.id);
  if (!pet) throw new ApiError(404, 'Publicación no encontrada.');
  const photos = await petRepository.findPhotos(pet.id);
  res.json({ pet: serializePet(pet, photos) });
}

async function update(req, res) {
  const pet = await petRepository.findById(req.params.id);
  if (!pet) throw new ApiError(404, 'Publicación no encontrada.');
  await assertOwnerOrAdmin(pet, req.user);

  const b = req.body || {};
  const changes = {};
  const map = {
    speciesId: 'species_id', name: 'name', breed: 'breed', size: 'size',
    sex: 'sex', description: 'description',
    contactWhatsapp: 'contact_whatsapp', contactEmail: 'contact_email',
  };
  for (const [key, column] of Object.entries(map)) {
    if (b[key] !== undefined) changes[column] = b[key] === '' ? null : b[key];
  }
  for (const key of ['isVaccinated', 'isNeutered', 'isDewormed']) {
    if (b[key] !== undefined) changes[key.replace(/([A-Z])/g, '_$1').toLowerCase()] = toBool(b[key]);
  }
  if (b.ageMode !== undefined) {
    Object.assign(changes, buildAgeFields(b));
  }

  if (Object.keys(changes).length > 0) {
    await petRepository.update(pet.id, changes);
  }

  const updated = await petRepository.findById(pet.id);
  const photos = await petRepository.findPhotos(pet.id);
  res.json({ pet: serializePet(updated, photos) });
}

async function updateStatus(req, res) {
  const pet = await petRepository.findById(req.params.id);
  if (!pet) throw new ApiError(404, 'Publicación no encontrada.');

  const { status } = req.body;
  const isAdmin = req.user.role === 'admin';
  const isOwner = pet.owner_id === Number(req.user.id);

  if (status === 'desactualizada') {
    if (!isAdmin) throw new ApiError(403, 'Solo un moderador puede marcar una publicación como desactualizada.');
  } else if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'No podés modificar una publicación que no es tuya.');
  } else if (!['disponible', 'en_proceso', 'adoptada'].includes(status)) {
    throw new ApiError(422, 'Estado inválido.');
  }

  await petRepository.update(pet.id, { status, status_changed_at: new Date() });
  const io = req.app.get('io');

  if (status === 'desactualizada' && isAdmin) {
    await notificationService.create(io, {
      user_id: pet.owner_id,
      type: 'post_deleted_by_admin',
      payload: { petId: pet.id, petName: pet.name, reason: 'marked_outdated' },
    });
    await adminActionRepository.create({
      admin_id: req.user.id,
      action_type: 'flag_outdated_pet',
      target_type: 'pet',
      target_id: pet.id,
    });
  }

  if (status === 'adoptada') {
    const favoritedByUserIds = await favoriteRepository.findUserIdsByPet(pet.id);
    for (const userId of favoritedByUserIds) {
      await notificationService.create(io, {
        user_id: userId,
        type: 'pet_favorited_adopted',
        payload: { petId: pet.id, petName: pet.name },
      });
    }
  }

  const updated = await petRepository.findById(pet.id);
  res.json({ pet: serializePet(updated, await petRepository.findPhotos(pet.id)) });
}

async function addPhotos(req, res) {
  const pet = await petRepository.findById(req.params.id);
  if (!pet) throw new ApiError(404, 'Publicación no encontrada.');
  await assertOwnerOrAdmin(pet, req.user);

  const files = req.files || [];
  if (files.length === 0) throw new ApiError(422, 'No se recibió ninguna imagen.');

  const { count } = await petRepository.countPhotos(pet.id);
  if (Number(count) + files.length > MAX_PHOTOS) {
    throw new ApiError(422, `Esta publicación ya tiene ${count} fotos, el máximo es ${MAX_PHOTOS}.`);
  }

  const { maxOrder } = await petRepository.nextPhotoSortOrder(pet.id);
  let sortOrder = (maxOrder ?? -1) + 1;

  for (const file of files) {
    const urls = await imageService.processImage(file.buffer, 'pets', pet.id);
    await petRepository.addPhoto({
      pet_id: pet.id,
      url_original: urls.original,
      url_medium: urls.medium,
      url_thumbnail: urls.thumbnail,
      sort_order: sortOrder++,
    });
  }

  const photos = await petRepository.findPhotos(pet.id);
  res.status(201).json({ photos: photos.map((p) => ({ id: p.id, thumbnail: p.url_thumbnail, medium: p.url_medium, original: p.url_original })) });
}

async function deletePhoto(req, res) {
  const pet = await petRepository.findById(req.params.id);
  if (!pet) throw new ApiError(404, 'Publicación no encontrada.');
  await assertOwnerOrAdmin(pet, req.user);

  const photo = await petRepository.findPhotoById(req.params.photoId);
  if (!photo || photo.pet_id !== pet.id) throw new ApiError(404, 'Foto no encontrada.');

  const { count } = await petRepository.countPhotos(pet.id);
  if (Number(count) <= 1) throw new ApiError(422, 'La publicación tiene que tener al menos una foto.');

  await petRepository.deletePhoto(photo.id, pet.id);
  res.json({ message: 'Foto eliminada.' });
}

async function remove(req, res) {
  const pet = await petRepository.findById(req.params.id);
  if (!pet) throw new ApiError(404, 'Publicación no encontrada.');

  const isAdmin = req.user.role === 'admin';
  await assertOwnerOrAdmin(pet, req.user);

  if (isAdmin && pet.owner_id !== Number(req.user.id)) {
    await notificationService.create(req.app.get('io'), {
      user_id: pet.owner_id,
      type: 'post_deleted_by_admin',
      payload: { petName: pet.name },
    });
    await adminActionRepository.create({
      admin_id: req.user.id,
      action_type: 'delete_pet',
      target_type: 'pet',
      target_id: pet.id,
    });
  }

  await petRepository.remove(pet.id);
  await imageService.deleteEntityImages('pets', pet.id);
  res.json({ message: 'Publicación eliminada.' });
}

async function stats(req, res) {
  const counts = await petRepository.countByStatus();
  res.json({
    available: counts.disponible,
    adopted: counts.adoptada,
  });
}

async function search(req, res) {
  const q = req.query;
  const page = q.page ? parseInt(q.page, 10) : 1;
  const pageSize = q.pageSize ? parseInt(q.pageSize, 10) : 20;

  const { pets, total } = await petRepository.search({
    speciesId: q.speciesId,
    sex: q.sex,
    size: q.size,
    minAgeYears: q.minAgeYears !== undefined ? parseInt(q.minAgeYears, 10) : undefined,
    maxAgeYears: q.maxAgeYears !== undefined ? parseInt(q.maxAgeYears, 10) : undefined,
    isVaccinated: q.isVaccinated,
    isNeutered: q.isNeutered,
    isDewormed: q.isDewormed,
    status: q.status,
    q: q.q,
    lat: q.lat !== undefined ? parseFloat(q.lat) : undefined,
    lng: q.lng !== undefined ? parseFloat(q.lng) : undefined,
    maxDistanceKm: q.maxDistanceKm !== undefined ? parseFloat(q.maxDistanceKm) : undefined,
    page,
    pageSize,
  });

  const photos = await petRepository.findPhotosForPets(pets.map((p) => p.id));
  const photosByPet = groupPhotosByPet(photos);

  res.json({
    pets: pets.map((p) => serializePet(p, photosByPet[p.id] || [])),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

async function listMine(req, res) {
  const status = req.query.status;
  const pets = await petRepository.findMineByOwner(req.user.id, status);
  const photos = await petRepository.findPhotosForPets(pets.map((p) => p.id));
  const photosByPet = groupPhotosByPet(photos);
  res.json({ pets: pets.map((p) => serializePet(p, photosByPet[p.id] || [])) });
}

function groupPhotosByPet(photos) {
  const map = {};
  for (const photo of photos) {
    if (!map[photo.pet_id]) map[photo.pet_id] = [];
    map[photo.pet_id].push(photo);
  }
  return map;
}

module.exports = { create, getOne, update, updateStatus, addPhotos, deletePhoto, remove, listMine, search, stats, serializePet, groupPhotosByPet };
