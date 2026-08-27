const { body } = require('express-validator');

const updateProfileValidator = [
  body('phone').optional({ checkFalsy: true }).trim().matches(/^[0-9+\s-]{6,30}$/).withMessage('El teléfono no es válido.'),
  body('cityGeorefId').optional({ checkFalsy: true }).notEmpty(),
  body('cityName').if(body('cityGeorefId').exists({ checkFalsy: true })).trim().notEmpty(),
  body('cityProvince').if(body('cityGeorefId').exists({ checkFalsy: true })).trim().notEmpty(),
  body('cityLat').if(body('cityGeorefId').exists({ checkFalsy: true })).isFloat({ min: -90, max: 90 }),
  body('cityLng').if(body('cityGeorefId').exists({ checkFalsy: true })).isFloat({ min: -180, max: 180 }),
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
