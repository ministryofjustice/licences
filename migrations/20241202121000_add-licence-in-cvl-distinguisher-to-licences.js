exports.up = (knex) =>
  Promise.all([
    knex.schema.table('licences', (table) => {
      table.boolean('licence_in_cvl').notNull().defaultTo(false)
    }),
  ])

exports.down = (knex) =>
  Promise.all([
    knex.schema.table('licences', (table) => {
      table.dropColumn('licence_in_cvl')
    }),
  ])
