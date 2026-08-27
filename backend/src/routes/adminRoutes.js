const { Router } = require('express');
const { param, body } = require('express-validator');
const adminController = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/users', adminController.listUsers);
router.patch('/users/:id/ban', [param('id').isInt({ min: 1 }), body('reason').optional().trim().isLength({ max: 500 })], validate, adminController.banUser);
router.patch('/users/:id/unban', [param('id').isInt({ min: 1 })], validate, adminController.unbanUser);
router.delete('/users/:id', [param('id').isInt({ min: 1 }), body('reason').optional().trim().isLength({ max: 500 })], validate, adminController.deleteUser);

router.get('/actions', adminController.listActions);

module.exports = router;
