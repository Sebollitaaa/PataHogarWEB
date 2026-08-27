const { Router } = require('express');
const cityController = require('../controllers/cityController');

const router = Router();

router.get('/', cityController.list);

module.exports = router;
