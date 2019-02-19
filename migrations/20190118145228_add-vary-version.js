exports.up = knex =>
  Promise.all([
    knex.schema.table('licence_versions', table => {
      table
        .integer('vary_version')
        .notNull()
        .defaultTo(0)
      table.dropUnique(['booking_id', 'version'])
      table.unique(['booking_id', 'version', 'vary_version'])
    }),
    knex.schema.table('licences', table => {
      table
        .integer('vary_version')
        .notNull()
        .defaultTo(0)
    }),
  ])

exports.down = knex =>
  Promise.all([
    knex.schema.table('licence_versions', table => {
      table.dropColumn('vary_version')
      table.unique(['booking_id', 'version'])
    }),
    knex.schema.table('licences', table => {
      table.dropColumn('vary_version')
    }),
  ])
