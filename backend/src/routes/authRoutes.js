const { Router } = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { loginLimiter, codeRequestLimiter } = require('../middleware/rateLimiters');
const {
  registerValidator,
  verifyEmailValidator,
  resendCodeValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/authValidators');

const router = Router();

router.post('/register', registerValidator, validate, authController.register);
router.post('/verify-email', verifyEmailValidator, validate, authController.verifyEmail);
router.post('/resend-code', codeRequestLimiter, resendCodeValidator, validate, authController.resendVerificationCode);
router.post('/login', loginLimiter, loginValidator, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', codeRequestLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);
router.get('/me', requireAuth, authController.me);

module.exports = router;
