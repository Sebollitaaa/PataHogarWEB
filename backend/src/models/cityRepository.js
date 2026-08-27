const db = require('../db/knex');

function findById(id) {
  return db('cities').where({ id }).first();
}

function findAll() {
  return db('cities').select('id', 'name', 'province', 'latitude', 'longitude').orderBy('name');
}

function findByGeorefId(georefId) {
  return db('cities').where({ georef_id: georefId }).first();
}

/**
 * Busca una localidad por su ID de Georef en nuestra caché local; si nunca se usó antes,
 * la guarda. Así cada localidad se resuelve una sola vez contra la API externa y después
 * queda disponible como cualquier otra fila de `cities` (con FK normal desde users/pets).
 */
async function findOrCreateByGeoref({ georefId, name, province, latitude, longitude }) {
  const existing = await findByGeorefId(georefId);
  if (existing) return existing;

  const [id] = await db('cities').insert({
    georef_id: georefId,
    name,
    province,
    country: 'Argentina',
    latitude,
    longitude,
  });
  return findById(id);
}

module.exports = { findById, findAll, findByGeorefId, findOrCreateByGeoref };
