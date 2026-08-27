const db = require('../db/knex');

async function list(req, res) {
  const species = await db('species').select('id', 'name', 'slug').orderBy('name');
  res.json({ species });
}

module.exports = { list };
