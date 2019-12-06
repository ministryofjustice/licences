exports.up = knex =>
  Promise.all([
    knex.schema.createTable('active_local_delivery_units', table => {
      table.increments('id').primary('pk_ldu')
      table
        .timestamp('timestamp')
        .notNullable()
        .defaultTo(knex.fn.now())
      table
        .string('ldu_code', 10)
        .notNullable()
        .unique()
      table.index(['ldu_code'], 'ldu_code')
    }),
  ])

exports.down = knex => knex.schema.dropTable('active_local_delivery_units')
