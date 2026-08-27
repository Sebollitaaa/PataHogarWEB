exports.up = function (knex) {
  return knex.schema.createTable('conversations', (table) => {
    table.increments('id').primary();
    table.integer('pet_id').unsigned().notNullable().references('id').inTable('pets').onDelete('CASCADE');

    // user_a_id siempre es el id numérico menor entre los dos participantes,
    // así el par (user_a_id, user_b_id) es determinístico y podemos indexar la unicidad.
    table.integer('user_a_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('user_b_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');

    table.boolean('archived_by_a').notNullable().defaultTo(false);
    table.boolean('archived_by_b').notNullable().defaultTo(false);
    table.boolean('deleted_by_a').notNullable().defaultTo(false);
    table.boolean('deleted_by_b').notNullable().defaultTo(false);

    table.timestamp('last_message_at').nullable();
    table.timestamps(true, true);

    table.unique(['pet_id', 'user_a_id', 'user_b_id']);
    table.index(['user_a_id']);
    table.index(['user_b_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('conversations');
};
