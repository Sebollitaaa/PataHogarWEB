const logger = require('../utils/logger');

const GEOREF_URL = 'https://apis.datos.gob.ar/georef/api/localidades';

/**
 * Autocompletado de localidades de Argentina contra la API oficial "Georef"
 * (Ministerio del Interior). Es pública, gratuita y no necesita API key.
 * Cubre pueblos chicos, no solo capitales de provincia.
 */
async function searchLocalities(query, limit = 8) {
  const url = `${GEOREF_URL}?nombre=${encodeURIComponent(query)}&campos=estandar&max=${limit}&orden=nombre`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Georef respondió ${res.status}`);
    const data = await res.json();

    return data.localidades.map((loc) => ({
      georefId: loc.id,
      name: loc.nombre,
      province: loc.provincia.nombre,
      latitude: loc.centroide.lat,
      longitude: loc.centroide.lon,
    }));
  } catch (err) {
    logger.warn('Georef no respondió, se sigue sin sugerencias:', err.message);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { searchLocalities };
