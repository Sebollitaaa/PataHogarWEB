exports.up = async function (knex) {
  await knex.schema.alterTable('cities', (table) => {
    // ID de la localidad en la API oficial "Georef" (Ministerio del Interior de Argentina).
    // Nula para las ciudades que ya teníamos cargadas a mano antes de sumar el autocompletado.
    table.string('georef_id', 20).nullable().unique();
  });

  // Ya no forzamos unicidad por (nombre, provincia, país): con miles de localidades reales
  // puede haber homónimos legítimos en departamentos distintos de la misma provincia.
  await knex.schema.alterTable('cities', (table) => {
    table.dropUnique(['name', 'province', 'country']);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('cities', (table) => {
    table.dropColumn('georef_id');
    table.unique(['name', 'province', 'country']);
  });
};
