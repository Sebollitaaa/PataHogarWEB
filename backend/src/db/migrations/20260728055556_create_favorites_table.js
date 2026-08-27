exports.up = function (knex) {
  return knex.schema.createTable('favorites', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('pet_id').unsigned().notNullable().references('id').inTable('pets').onDelete('CASCADE');
    table.timestamps(true, true);

    table.unique(['user_id', 'pet_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('favorites');
};
