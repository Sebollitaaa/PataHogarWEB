const { body } = require('express-validator');

const registerValidator = [
  body('firstName').trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener al menos 2 caracteres.'),
  body('lastName').trim().isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener al menos 2 caracteres.'),
  body('email').trim().isEmail().withMessage('El email no es válido.').normalizeEmail(),
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

const loginValidator = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Ingresá tu contraseña.'),
  body('rememberMe').optional().isBoolean(),
];

module.exports = {
  registerValidator,
  loginValidator,
};
