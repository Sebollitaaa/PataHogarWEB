const { body, param, query } = require('express-validator');

const toBool = (v) => v === true || v === 'true' || v === '1' || v === 1;

const createPetValidator = [
  body('speciesId').isInt({ min: 1 }).withMessage('Elegí una especie válida.'),
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('El nombre de la mascota es obligatorio.'),
  body('breed').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('size').isIn(['pequeno', 'mediano', 'grande']).withMessage('Tamaño inválido.'),
  body('ageYears').isInt({ min: 0, max: 40 }).withMessage('Edad (años) inválida.'),
  body('ageMonths').isInt({ min: 0, max: 11 }).withMessage('Edad (meses) inválida.'),
  body('sex').isIn(['macho', 'hembra']).withMessage('Sexo inválido.'),
  body('isVaccinated').optional().customSanitizer(toBool).isBoolean(),
  body('isNeutered').optional().customSanitizer(toBool).isBoolean(),
  body('isDewormed').optional().customSanitizer(toBool).isBoolean(),
  body('description').trim().isLength({ min: 10, max: 3000 }).withMessage('Contanos un poco más sobre la mascota (mínimo 10 caracteres).'),
  body('contactWhatsapp').optional({ checkFalsy: true }).trim().matches(/^[0-9+\s-]{6,30}$/).withMessage('El WhatsApp no es válido.'),
  body('contactEmail').optional({ checkFalsy: true }).trim().isEmail().withMessage('El email de contacto no es válido.'),
];

const updatePetValidator = [
  body('speciesId').optional().isInt({ min: 1 }),
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('breed').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('size').optional().isIn(['pequeno', 'mediano', 'grande']),
  body('ageYears').optional().isInt({ min: 0, max: 40 }),
  body('ageMonths').optional().isInt({ min: 0, max: 11 }),
  body('sex').optional().isIn(['macho', 'hembra']),
  body('isVaccinated').optional().customSanitizer(toBool).isBoolean(),
  body('isNeutered').optional().customSanitizer(toBool).isBoolean(),
  body('isDewormed').optional().customSanitizer(toBool).isBoolean(),
  body('description').optional().trim().isLength({ min: 10, max: 3000 }),
  body('contactWhatsapp').optional({ checkFalsy: true }).trim().matches(/^[0-9+\s-]{6,30}$/),
  body('contactEmail').optional({ checkFalsy: true }).trim().isEmail(),
];

const updateStatusValidator = [
  body('status').isIn(['disponible', 'en_proceso', 'adoptada', 'desactualizada']).withMessage('Estado inválido.'),
];

const petIdParamValidator = [param('id').isInt({ min: 1 })];

const searchPetsValidator = [
  query('speciesId').optional().isInt({ min: 1 }),
  query('sex').optional().isIn(['macho', 'hembra']),
  query('size').optional().isIn(['pequeno', 'mediano', 'grande']),
  query('minAgeYears').optional().isInt({ min: 0 }),
  query('maxAgeYears').optional().isInt({ min: 0 }),
  query('isVaccinated').optional().isIn(['true', 'false']),
  query('isNeutered').optional().isIn(['true', 'false']),
  query('isDewormed').optional().isIn(['true', 'false']),
  query('status').optional().isIn(['disponible', 'en_proceso', 'adoptada', 'desactualizada']),
  query('q').optional().trim().isLength({ max: 120 }),
  query('lat').optional().isFloat({ min: -90, max: 90 }),
  query('lng').optional().isFloat({ min: -180, max: 180 }),
  query('maxDistanceKm').optional().isFloat({ min: 1, max: 20000 }),
  query('page').optional().isInt({ min: 1 }),
  query('pageSize').optional().isInt({ min: 1, max: 60 }),
];

module.exports = {
  createPetValidator,
  updatePetValidator,
  updateStatusValidator,
  petIdParamValidator,
  searchPetsValidator,
};
