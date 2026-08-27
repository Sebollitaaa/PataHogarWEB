const { body } = require('express-validator');
const env = require('../config/env');

const registerValidator = [
  body('firstName').trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener al menos 2 caracteres.'),
  body('lastName').trim().isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener al menos 2 caracteres.'),
  body('email').trim().isEmail().withMessage('El email no es válido.').normalizeEmail()
    // Restricción temporal: mientras no tengamos un dominio propio verificado en el
    // proveedor de email, solo aceptamos Gmail para asegurar que el código de
    // verificación llegue siempre. Sacar este .custom() (o poner ALLOW_ONLY_GMAIL_REGISTRATION=false)
    // cuando se verifique un dominio propio.
    .custom((value) => {
      if (env.allowOnlyGmailRegistration && !/@gmail\.com$/i.test(value)) {
        throw new Error('Por ahora solo se puede registrar con un email de Gmail (@gmail.com).');
      }
      return true;
    }),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
  body('phone').trim().matches(/^[0-9+\s-]{6,30}$/).withMessage('El teléfono no es válido.'),
  body('cityGeorefId').notEmpty().withMessage('Elegí tu ciudad de la lista de sugerencias.'),
  body('cityName').trim().notEmpty(),
  body('cityProvince').trim().notEmpty(),
  body('cityLat').isFloat({ min: -90, max: 90 }),
  body('cityLng').isFloat({ min: -180, max: 180 }),
  body('verifiedLat').optional({ nullable: true }).isFloat({ min: -90, max: 90 }),
  body('verifiedLng').optional({ nullable: true }).isFloat({ min: -180, max: 180 }),
];

const verifyEmailValidator = [
  body('email').trim().isEmail().normalizeEmail(),
  body('code').trim().isLength({ min: 6, max: 6 }).isNumeric(),
];

const resendCodeValidator = [
  body('email').trim().isEmail().normalizeEmail(),
];

const loginValidator = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Ingresá tu contraseña.'),
  body('rememberMe').optional().isBoolean(),
];

const forgotPasswordValidator = [
  body('email').trim().isEmail().normalizeEmail(),
];

const resetPasswordValidator = [
  body('email').trim().isEmail().normalizeEmail(),
  body('code').trim().isLength({ min: 6, max: 6 }).isNumeric(),
  body('newPassword').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
];

module.exports = {
  registerValidator,
  verifyEmailValidator,
  resendCodeValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};
