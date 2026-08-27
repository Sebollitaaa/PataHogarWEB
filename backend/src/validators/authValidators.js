const { body } = require('express-validator');

const registerValidator = [
  body('firstName').trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener al menos 2 caracteres.'),
  body('lastName').trim().isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener al menos 2 caracteres.'),
  body('email').trim().isEmail().withMessage('El email no es válido.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
  body('phone').trim().matches(/^[0-9+\s-]{6,30}$/).withMessage('El teléfono no es válido.'),
  body('cityId').isInt({ min: 1 }).withMessage('Elegí una ciudad válida.'),
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
