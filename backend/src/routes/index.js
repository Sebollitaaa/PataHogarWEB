const { Router } = require('express');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', require('./authRoutes'));
router.use('/cities', require('./cityRoutes'));
router.use('/species', require('./speciesRoutes'));
router.use('/pets', require('./petRoutes'));
router.use('/favorites', require('./favoriteRoutes'));
router.use('/conversations', require('./conversationRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/users', require('./userRoutes'));

module.exports = router;
