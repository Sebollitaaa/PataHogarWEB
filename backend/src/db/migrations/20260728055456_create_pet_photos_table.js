exports.up = function (knex) {
  return knex.schema.createTable('pet_photos', (table) => {
    table.increments('id').primary();
    table.integer('pet_id').unsigned().notNullable().references('id').inTable('pets').onDelete('CASCADE');
    table.string('url_original', 255).notNullable();
    table.string('url_medium', 255).notNullable();
    table.string('url_thumbnail', 255).notNullable();
    table.integer('sort_order').unsigned().notNullable().defaultTo(0);
    table.timestamps(true, true);

    table.index(['pet_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('pet_photos');
};
