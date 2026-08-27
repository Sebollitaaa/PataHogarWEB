const { Router } = require('express');
const petController = require('../controllers/petController');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createPetValidator,
  updatePetValidator,
  updateStatusValidator,
  petIdParamValidator,
  searchPetsValidator,
} = require('../validators/petValidators');

const router = Router();

router.get('/mine', requireAuth, petController.listMine);
router.get('/stats', petController.stats);
router.get('/', searchPetsValidator, validate, petController.search);
router.post('/', requireAuth, upload.array('photos', 10), createPetValidator, validate, petController.create);

router.get('/:id', petIdParamValidator, validate, petController.getOne);
router.patch('/:id', requireAuth, petIdParamValidator, updatePetValidator, validate, petController.update);
router.patch('/:id/status', requireAuth, petIdParamValidator, updateStatusValidator, validate, petController.updateStatus);
router.delete('/:id', requireAuth, petIdParamValidator, validate, petController.remove);

router.post('/:id/photos', requireAuth, petIdParamValidator, validate, upload.array('photos', 10), petController.addPhotos);
router.delete('/:id/photos/:photoId', requireAuth, petIdParamValidator, validate, petController.deletePhoto);

module.exports = router;
