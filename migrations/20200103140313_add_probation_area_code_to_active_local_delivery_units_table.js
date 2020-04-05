exports.up = (knex) =>
  Promise.all([
    knex.schema.alterTable('active_local_delivery_units', (table) => {
      table.string('probation_area_code').notNullable()
    }),
  ])

exports.down = (knex) =>
  Promise.all([
    knex.schema.table('active_local_delivery_units', (table) => {
      table.dropColumn('probation_area_code')
    }),
  ])
