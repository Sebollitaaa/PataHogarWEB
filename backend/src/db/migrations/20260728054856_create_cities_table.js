exports.up = function (knex) {
  return knex.schema.createTable('cities', (table) => {
    table.increments('id').primary();
    table.string('name', 120).notNullable();
    table.string('province', 120).notNullable();
    table.string('country', 80).notNullable().defaultTo('Argentina');
    table.decimal('latitude', 10, 7).notNullable();
    table.decimal('longitude', 10, 7).notNullable();
    table.timestamps(true, true);

    table.unique(['name', 'province', 'country']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('cities');
};
