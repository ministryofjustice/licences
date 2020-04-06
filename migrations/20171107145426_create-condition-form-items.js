exports.up = (knex) =>
  Promise.all([
    knex.schema.createTable('conditions_ui', (table) => {
      table.increments('id').primary('pk_conditions_ui')
      table.string('ui_id')
      table.jsonb('field_position').nullable()
    }),
  ])

exports.down = (knex) => knex.schema.dropTable('conditions_ui')
