const cityRepository = require('../models/cityRepository');
const georefService = require('../services/georefService');

async function list(req, res) {
  const cities = await cityRepository.findAll();
  res.json({ cities });
}

async function search(req, res) {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ cities: [] });

  const localities = await georefService.searchLocalities(q);
  res.json({
    cities: localities.map((l) => ({
      georefId: l.georefId,
      name: l.name,
      province: l.province,
      latitude: l.latitude,
      longitude: l.longitude,
    })),
  });
}

module.exports = { list, search };
