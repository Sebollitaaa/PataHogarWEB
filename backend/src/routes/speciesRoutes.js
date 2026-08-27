const { Router } = require('express');
const speciesController = require('../controllers/speciesController');

const router = Router();
router.get('/', speciesController.list);

module.exports = router;
