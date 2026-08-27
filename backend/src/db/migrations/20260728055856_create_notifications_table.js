exports.up = function (knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enu('type', [
      'pet_favorited_adopted',
      'post_deleted_by_admin',
      'new_message_on_your_pet',
      'reply_to_inquiry',
    ]).notNullable();
    table.json('payload').notNullable();
    table.boolean('is_read').notNullable().defaultTo(false);
    table.timestamps(true, true);

    table.index(['user_id', 'is_read']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('notifications');
};
