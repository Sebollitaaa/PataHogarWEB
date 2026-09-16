const bcrypt = require('bcrypt');
const ApiError = require('../utils/ApiError');
const userRepository = require('../models/userRepository');
const cityRepository = require('../models/cityRepository');
const refreshTokenRepository = require('../models/refreshTokenRepository');
const tokenService = require('../services/tokenService');
const locationService = require('../services/locationService');
const env = require('../config/env');

const BCRYPT_ROUNDS = 12;
const REFRESH_COOKIE_NAME = 'refresh_token';

function refreshCookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: maxAgeMs,
    path: '/api/auth',
  };
}

function toPublicUser(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    profilePhotoUrl: user.profile_photo_url,
    cityId: user.city_id,
    cityName: user.city_name,
    cityProvince: user.city_province,
    role: user.role,
    createdAt: user.created_at,
  };
}

async function register(req, res) {
  const {
    firstName, lastName, email, password, phone, verifiedLat, verifiedLng,
    cityGeorefId, cityName, cityProvince, cityLat, cityLng,
  } = req.body;

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'Ya existe una cuenta registrada con ese email.');
  }

  const city = await cityRepository.findOrCreateByGeoref({
    georefId: cityGeorefId,
    name: cityName,
    province: cityProvince,
    latitude: cityLat,
    longitude: cityLng,
  });

  const location = locationService.resolveUserLocation(city, verifiedLat, verifiedLng);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await userRepository.create({
    first_name: firstName,
    last_name: lastName,
    email,
    password_hash: passwordHash,
    phone,
    city_id: city.id,
    verified_lat: location.verifiedLat,
    verified_lng: location.verifiedLng,
    location_source: location.locationSource,
  });

  res.status(201).json({
    message: 'Cuenta creada. Ya podés iniciar sesión.',
    email: user.email,
  });
}

async function issueSession(res, user, rememberMe, req) {
  const accessToken = tokenService.signAccessToken(user);
  const { token, tokenHash, expiresAt, days } = tokenService.generateRefreshToken(rememberMe);

  await refreshTokenRepository.create({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
    user_agent: req.headers['user-agent'] || null,
    ip_address: req.ip,
  });

  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions(days * 24 * 60 * 60 * 1000));
  return accessToken;
}

async function login(req, res) {
  const { email, password, rememberMe } = req.body;

  const user = await userRepository.findByEmail(email);
  if (!user) throw new ApiError(401, 'Email o contraseña incorrectos.');

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) throw new ApiError(401, 'Email o contraseña incorrectos.');

  if (user.status === 'banned') throw new ApiError(403, 'Tu cuenta fue suspendida.');

  const accessToken = await issueSession(res, user, Boolean(rememberMe), req);
  await userRepository.update(user.id, { last_login_at: new Date() });

  const publicUser = await userRepository.findPublicById(user.id);
  res.json({ accessToken, user: toPublicUser(publicUser) });
}

async function refresh(req, res) {
  const token = req.cookies[REFRESH_COOKIE_NAME];
  if (!token) throw new ApiError(401, 'No hay sesión activa.');

  const tokenHash = tokenService.hashRefreshToken(token);
  const record = await refreshTokenRepository.findActiveByHash(tokenHash);
  if (!record) {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
    throw new ApiError(401, 'Sesión expirada, iniciá sesión de nuevo.');
  }

  const user = await userRepository.findById(record.user_id);
  if (!user || user.status === 'banned') {
    throw new ApiError(401, 'Sesión inválida.');
  }

  // Rotación: se revoca el token usado y se emite uno nuevo.
  await refreshTokenRepository.revoke(record.id);
  const rememberMe = record.expires_at - record.created_at > 2 * 24 * 60 * 60 * 1000;
  const accessToken = await issueSession(res, user, rememberMe, req);

  const publicUser = await userRepository.findPublicById(user.id);
  res.json({ accessToken, user: toPublicUser(publicUser) });
}

async function logout(req, res) {
  const token = req.cookies[REFRESH_COOKIE_NAME];
  if (token) {
    const tokenHash = tokenService.hashRefreshToken(token);
    const record = await refreshTokenRepository.findActiveByHash(tokenHash);
    if (record) await refreshTokenRepository.revoke(record.id);
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.json({ message: 'Sesión cerrada.' });
}

async function me(req, res) {
  const user = await userRepository.findPublicById(req.user.id);
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ user: toPublicUser(user) });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  toPublicUser,
};
