const { Router } = require('express');
const { param } = require('express-validator');
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { updateProfileValidator } = require('../validators/userValidators');

const router = Router();

router.patch('/me', requireAuth, upload.single('profilePhoto'), updateProfileValidator, validate, userController.updateMe);
router.get('/:id', [param('id').isInt({ min: 1 })], validate, userController.getPublicProfile);

module.exports = router;
