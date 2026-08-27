exports.up = function (knex) {
  return knex.schema.createTable('verification_codes', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('code_hash', 255).notNullable();
    table.enu('type', ['email_verification', 'password_reset']).notNullable();
    table.enu('method', ['email', 'sms']).notNullable().defaultTo('email');
    table.timestamp('expires_at').notNullable();
    table.timestamp('used_at').nullable();
    table.integer('attempts').unsigned().notNullable().defaultTo(0);
    table.timestamps(true, true);

    table.index(['user_id', 'type']);
    table.index(['expires_at']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('verification_codes');
};
