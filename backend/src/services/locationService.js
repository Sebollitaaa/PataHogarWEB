const ApiError = require('../utils/ApiError');
const { haversineDistanceKm } = require('../utils/geo');
const env = require('../config/env');
const cityRepository = require('../models/cityRepository');

/**
 * Decide qué ubicación usar para un usuario a partir de la ciudad declarada
 * y (opcionalmente) las coordenadas reales de geolocalización del navegador.
 * Si la distancia entre ambas supera el umbral configurado, se rechaza.
 */
function resolveUserLocation(city, verifiedLat, verifiedLng) {
  if (verifiedLat === undefined || verifiedLat === null || verifiedLng === undefined || verifiedLng === null) {
    return { locationSource: 'city_only', verifiedLat: null, verifiedLng: null, effectiveLat: city.latitude, effectiveLng: city.longitude };
  }

  const distanceKm = haversineDistanceKm(city.latitude, city.longitude, verifiedLat, verifiedLng);
  if (distanceKm > env.locationMismatchBlockKm) {
    throw new ApiError(
      422,
      `Tu ubicación real no coincide con la ciudad seleccionada (diferencia de ${Math.round(distanceKm)} km). Revisá la ciudad o volvé a intentar con la geolocalización activada.`
    );
  }

  return { locationSource: 'geolocation', verifiedLat, verifiedLng, effectiveLat: verifiedLat, effectiveLng: verifiedLng };
}

/**
 * Ubicación efectiva de un usuario para asociar a sus publicaciones:
 * la geolocalización verificada si existe, si no el centro de la ciudad declarada.
 */
async function getEffectiveUserLocation(user) {
  if (user.location_source === 'geolocation' && user.verified_lat != null && user.verified_lng != null) {
    return { lat: Number(user.verified_lat), lng: Number(user.verified_lng) };
  }
  const city = await cityRepository.findById(user.city_id);
  return { lat: Number(city.latitude), lng: Number(city.longitude) };
}

module.exports = { resolveUserLocation, getEffectiveUserLocation };
