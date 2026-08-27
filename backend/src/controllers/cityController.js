const cityRepository = require('../models/cityRepository');

async function list(req, res) {
  const cities = await cityRepository.findAll();
  res.json({ cities });
}

module.exports = { list };
