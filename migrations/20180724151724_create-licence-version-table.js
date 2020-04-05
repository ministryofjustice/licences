exports.up = (knex) =>
  Promise.all([
    knex.schema.createTable('licence_versions', (table) => {
      table.increments('id').primary('pk_licence')
      table.timestamp('timestamp').notNullable().defaultTo(knex.fn.now())
      table.jsonb('licence').nullable()
      table.integer('booking_id').notNullable()
      table.integer('version').notNullable()
      table.string('template').notNullable()
      table.index(['booking_id', 'version', 'id', 'template'], 'licence_version_by_booking_id')
      table.unique(['booking_id', 'version'])
    }),
  ])

exports.down = (knex) => knex.schema.dropTable('licence_versions')
