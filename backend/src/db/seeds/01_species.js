exports.seed = async function (knex) {
  await knex('species').del();
  await knex('species').insert([
    { name: 'Perro', slug: 'perro' },
    { name: 'Gato', slug: 'gato' },
    { name: 'Conejo', slug: 'conejo' },
    { name: 'Ave', slug: 'ave' },
    { name: 'Roedor', slug: 'roedor' },
    { name: 'Pez', slug: 'pez' },
    { name: 'Reptil', slug: 'reptil' },
    { name: 'Otro', slug: 'otro' },
  ]);
};
