// Elimina por completo el sistema de verificación por email / código (y su uso compartido
// para recuperar contraseña): la tabla verification_codes y las columnas de users que lo
// soportaban. Necesaria porque estas bases ya tenían ese esquema creado antes de sacarlo
// del código; una instalación nueva desde cero nunca lo crea (ver create_users_table).
exports.up = async function (knex) {
  await knex.schema.dropTableIfExists('verification_codes');

  const hasIsVerified = await knex.schema.hasColumn('users', 'is_verified');
  const hasVerificationMethod = await knex.schema.hasColumn('users', 'verification_method');

  if (hasIsVerified || hasVerificationMethod) {
    await knex.schema.alterTable('users', (table) => {
      if (hasIsVerified) table.dropColumn('is_verified');
      if (hasVerificationMethod) table.dropColumn('verification_method');
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.alterTable('users', (table) => {
    table.enu('verification_method', ['email', 'sms']).notNullable().defaultTo('email');
    table.boolean('is_verified').notNullable().defaultTo(true);
  });

  await knex.schema.createTable('verification_codes', (table) => {
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
