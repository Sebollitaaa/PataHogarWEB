exports.up = function (knex) {
  return knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 255).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('revoked_at').nullable();
    table.string('user_agent', 255).nullable();
    table.string('ip_address', 45).nullable();
    table.timestamps(true, true);

    table.index(['user_id']);
    table.index(['expires_at']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('refresh_tokens');
};
