const { Router } = require('express');
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { updateProfileValidator } = require('../validators/userValidators');

const router = Router();

router.patch('/me', requireAuth, upload.single('profilePhoto'), updateProfileValidator, validate, userController.updateMe);

module.exports = router;
