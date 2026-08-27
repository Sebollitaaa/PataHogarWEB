exports.up = function (knex) {
  return knex.schema.createTable('admin_actions', (table) => {
    table.increments('id').primary();
    table.integer('admin_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enu('action_type', ['delete_pet', 'ban_user', 'delete_user', 'flag_outdated_pet']).notNullable();
    table.enu('target_type', ['pet', 'user']).notNullable();
    table.integer('target_id').unsigned().notNullable();
    table.string('reason', 500).nullable();
    table.timestamps(true, true);

    table.index(['admin_id']);
    table.index(['target_type', 'target_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('admin_actions');
};
