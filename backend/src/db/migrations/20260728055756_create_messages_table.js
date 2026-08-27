exports.up = function (knex) {
  return knex.schema.createTable('messages', (table) => {
    table.increments('id').primary();
    table.integer('conversation_id').unsigned().notNullable().references('id').inTable('conversations').onDelete('CASCADE');
    table.integer('sender_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.text('content').notNullable();
    table.timestamp('read_at').nullable();
    table.timestamps(true, true);

    table.index(['conversation_id', 'created_at']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('messages');
};
