exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('email', 190).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('phone', 30).notNullable();
    table.string('profile_photo_url', 255).nullable();

    table.integer('city_id').unsigned().notNullable().references('id').inTable('cities').onDelete('RESTRICT');

    // Ubicación verificada por geolocalización del navegador (si el usuario la otorgó).
    table.decimal('verified_lat', 10, 7).nullable();
    table.decimal('verified_lng', 10, 7).nullable();
    table.enu('location_source', ['geolocation', 'city_only']).notNullable().defaultTo('city_only');

    table.enu('role', ['user', 'admin']).notNullable().defaultTo('user');
    table.enu('status', ['active', 'banned']).notNullable().defaultTo('active');

    table.timestamp('last_login_at').nullable();
    table.timestamps(true, true);

    table.index(['city_id']);
    table.index(['role']);
    table.index(['status']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
