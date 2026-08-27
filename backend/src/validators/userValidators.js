const { body } = require('express-validator');

const updateProfileValidator = [
  body('phone').optional({ checkFalsy: true }).trim().matches(/^[0-9+\s-]{6,30}$/).withMessage('El teléfono no es válido.'),
  body('cityId').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Elegí una ciudad válida.'),
  body('verifiedLat').optional({ nullable: true, checkFalsy: true }).isFloat({ min: -90, max: 90 }),
  body('verifiedLng').optional({ nullable: true, checkFalsy: true }).isFloat({ min: -180, max: 180 }),
  body('currentPassword').if(body('newPassword').exists({ checkFalsy: true })).notEmpty().withMessage('Ingresá tu contraseña actual.'),
  body('newPassword').optional({ checkFalsy: true }).isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres.'),
  body('confirmNewPassword').if(body('newPassword').exists({ checkFalsy: true })).custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error('Las contraseñas no coinciden.');
    return true;
  }),
];

module.exports = { updateProfileValidator };
