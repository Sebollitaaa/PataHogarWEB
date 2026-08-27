exports.up = function (knex) {
  return knex.schema.createTable('pets', (table) => {
    table.increments('id').primary();
    table.integer('owner_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('species_id').unsigned().notNullable().references('id').inTable('species').onDelete('RESTRICT');

    table.string('name', 100).notNullable();
    table.string('breed', 100).nullable();
    table.enu('size', ['pequeno', 'mediano', 'grande']).notNullable();
    table.integer('age_years').unsigned().notNullable().defaultTo(0);
    table.integer('age_months').unsigned().notNullable().defaultTo(0);
    table.enu('sex', ['macho', 'hembra']).notNullable();

    table.boolean('is_vaccinated').notNullable().defaultTo(false);
    table.boolean('is_neutered').notNullable().defaultTo(false);
    table.boolean('is_dewormed').notNullable().defaultTo(false);

    table.text('description').notNullable();

    table.enu('status', ['disponible', 'en_proceso', 'adoptada', 'desactualizada']).notNullable().defaultTo('disponible');
    table.timestamp('status_changed_at').notNullable().defaultTo(knex.fn.now());

    // Copiada de la ubicación verificada del dueño al momento de publicar.
    table.decimal('latitude', 10, 7).notNullable();
    table.decimal('longitude', 10, 7).notNullable();

    table.string('contact_whatsapp', 30).nullable();
    table.string('contact_email', 190).nullable();

    table.timestamps(true, true);

    table.index(['species_id']);
    table.index(['status']);
    table.index(['owner_id']);
    table.index(['latitude', 'longitude']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('pets');
};
