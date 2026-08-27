const bcrypt = require('bcrypt');
const ApiError = require('../utils/ApiError');
const userRepository = require('../models/userRepository');
const cityRepository = require('../models/cityRepository');
const verificationCodeRepository = require('../models/verificationCodeRepository');
const refreshTokenRepository = require('../models/refreshTokenRepository');
const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
const locationService = require('../services/locationService');
const { generateNumericCode, hashCode } = require('../utils/codes');
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
    isVerified: user.is_verified,
    createdAt: user.created_at,
  };
}

async function createAndSendVerificationCode(user, type) {
  await verificationCodeRepository.invalidateActive(user.id, type);
  const code = generateNumericCode(6);
  const expiresAt = new Date(Date.now() + env.verificationCodeExpiresMin * 60 * 1000);

  await verificationCodeRepository.create({
    user_id: user.id,
    code_hash: hashCode(code),
    type,
    method: 'email',
    expires_at: expiresAt,
  });

  if (type === 'email_verification') {
    await emailService.sendVerificationCodeEmail(user.email, user.first_name, code);
  } else {
    await emailService.sendPasswordResetEmail(user.email, user.first_name, code);
  }
}

async function register(req, res) {
  const {
    firstName, lastName, email, password, phone, verifiedLat, verifiedLng,
    cityGeorefId, cityName, cityProvince, cityLat, cityLng,
  } = req.body;

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    if (existing.is_verified) {
      throw new ApiError(409, 'Ya existe una cuenta registrada con ese email.');
    }
    if (env.skipEmailVerification) {
      await userRepository.update(existing.id, { is_verified: true });
      return res.status(201).json({
        message: 'Cuenta activada. Ya podés iniciar sesión.',
        email: existing.email,
        requiresVerification: false,
      });
    }
    // La cuenta existe pero nunca se verificó (por ejemplo, el email de verificación
    // falló la primera vez). En vez de dejar al usuario trabado con un 409, le
    // reenviamos un código nuevo para que pueda continuar desde donde quedó.
    await createAndSendVerificationCode(existing, 'email_verification');
    return res.status(201).json({
      message: 'Ya tenías una cuenta pendiente de verificación. Te enviamos un código nuevo.',
      email: existing.email,
      requiresVerification: true,
    });
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
    // Modo temporal sin verificación por email: la cuenta queda operativa al instante.
    is_verified: env.skipEmailVerification,
  });

  if (env.skipEmailVerification) {
    return res.status(201).json({
      message: 'Cuenta creada. Ya podés iniciar sesión (verificación por email desactivada por ahora).',
      email: user.email,
      requiresVerification: false,
    });
  }

  await createAndSendVerificationCode(user, 'email_verification');

  res.status(201).json({
    message: 'Cuenta creada. Te enviamos un código de verificación a tu email.',
    email: user.email,
    requiresVerification: true,
  });
}

async function verifyEmail(req, res) {
  const { email, code } = req.body;

  const user = await userRepository.findByEmail(email);
  if (!user) throw new ApiError(404, 'No encontramos una cuenta con ese email.');
  if (user.is_verified) throw new ApiError(400, 'Esta cuenta ya está verificada.');

  const record = await verificationCodeRepository.findLatestActive(user.id, 'email_verification');
  if (!record) throw new ApiError(400, 'El código expiró o no existe. Pedí uno nuevo.');
  if (record.attempts >= 5) throw new ApiError(429, 'Superaste el límite de intentos. Pedí un código nuevo.');

  if (record.code_hash !== hashCode(code)) {
    await verificationCodeRepository.incrementAttempts(record.id);
    throw new ApiError(400, 'El código ingresado es incorrecto.');
  }

  await verificationCodeRepository.markUsed(record.id);
  await userRepository.update(user.id, { is_verified: true });

  res.json({ message: 'Cuenta verificada correctamente. Ya podés iniciar sesión.' });
}

async function resendVerificationCode(req, res) {
  const { email } = req.body;
  const user = await userRepository.findByEmail(email);

  // Respuesta genérica siempre, para no filtrar si el email existe o no.
  if (user && !user.is_verified) {
    await createAndSendVerificationCode(user, 'email_verification');
  }

  res.json({ message: 'Si el email corresponde a una cuenta pendiente de verificación, te enviamos un nuevo código.' });
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
  if (!user.is_verified) throw new ApiError(403, 'Tenés que verificar tu email antes de iniciar sesión.');

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

async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await userRepository.findByEmail(email);

  if (user) {
    await createAndSendVerificationCode(user, 'password_reset');
  }

  res.json({ message: 'Si el email existe, te enviamos un código para recuperar tu contraseña.' });
}

async function resetPassword(req, res) {
  const { email, code, newPassword } = req.body;

  const user = await userRepository.findByEmail(email);
  if (!user) throw new ApiError(404, 'No encontramos una cuenta con ese email.');

  const record = await verificationCodeRepository.findLatestActive(user.id, 'password_reset');
  if (!record) throw new ApiError(400, 'El código expiró o no existe. Pedí uno nuevo.');
  if (record.attempts >= 5) throw new ApiError(429, 'Superaste el límite de intentos. Pedí un código nuevo.');

  if (record.code_hash !== hashCode(code)) {
    await verificationCodeRepository.incrementAttempts(record.id);
    throw new ApiError(400, 'El código ingresado es incorrecto.');
  }

  await verificationCodeRepository.markUsed(record.id);
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await userRepository.update(user.id, { password_hash: passwordHash });

  // Por seguridad, cerramos todas las sesiones activas al cambiar la contraseña.
  await refreshTokenRepository.revokeAllForUser(user.id);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });

  res.json({ message: 'Contraseña actualizada. Iniciá sesión de nuevo.' });
}

async function me(req, res) {
  const user = await userRepository.findPublicById(req.user.id);
  if (!user) throw new ApiError(404, 'Usuario no encontrado.');
  res.json({ user: toPublicUser(user) });
}

module.exports = {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  me,
  toPublicUser,
};
