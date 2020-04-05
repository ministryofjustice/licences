exports.up = (knex) =>
  Promise.all([
    knex.schema.alterTable('active_local_delivery_units', (table) => {
      table.string('ldu_code', 10).notNullable().unique().alter()
    }),
  ])

exports.down = (knex) =>
  Promise.all([
    knex.schema.alterTable('active_local_delivery_units', (table) => {
      table.string('ldu_code', 10).notNullable().alter()
    }),
  ])
