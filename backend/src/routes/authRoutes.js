const { Router } = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiters');
const { registerValidator, loginValidator } = require('../validators/authValidators');

const router = Router();

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginLimiter, loginValidator, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

module.exports = router;
