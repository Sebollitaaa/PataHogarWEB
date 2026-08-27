const { Router } = require('express');
const favoriteController = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, favoriteController.listMine);
router.post('/:petId', requireAuth, favoriteController.add);
router.delete('/:petId', requireAuth, favoriteController.remove);

module.exports = router;
