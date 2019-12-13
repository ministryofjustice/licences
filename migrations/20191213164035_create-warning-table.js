exports.up = knex =>
  knex.schema.createTable('warnings', table => {
    table.increments('id').primary('pk_warnings')
    table
      .timestamp('timestamp')
      .notNullable()
      .defaultTo(knex.fn.now())
    table
      .integer('booking_id')
      .unique()
      .notNullable()
    table.string('code').notNullable()
    table.string('message').notNullable()
    table.boolean('acknowledged').notNullable()
    table.index(['timestamp'], 'timestamp')
    table.index(['acknowledged'], 'acknowledged')
    table.index(['booking_id'], 'bookingId')
  })

exports.down = knex => knex.schema.dropTable('warnings')
