exports.up = function (knex) {
  return knex.schema.createTable('species', (table) => {
    table.increments('id').primary();
    table.string('name', 60).notNullable().unique();
    table.string('slug', 60).notNullable().unique();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('species');
};
