exports.up = async function (knex) {
  await knex.schema.alterTable('pets', (table) => {
    // 'birth_date': el dueño marcó cuándo nació y la edad se calcula sola.
    // 'manual': el dueño escribió la edad a mano (puede dejar años/meses en 0 y usar solo días, etc).
    table.enu('age_mode', ['birth_date', 'manual']).notNullable().defaultTo('manual');
    table.date('birth_date').nullable();
    table.integer('age_days').unsigned().notNullable().defaultTo(0);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('pets', (table) => {
    table.dropColumn('age_mode');
    table.dropColumn('birth_date');
    table.dropColumn('age_days');
  });
};
