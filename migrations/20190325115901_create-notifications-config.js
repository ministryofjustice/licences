exports.up = (knex) =>
  Promise.all([
    knex.schema.createTable('notifications_config', (table) => {
      table.increments('id').primary('pk_notifications')
      table.string('email').notNullable()
      table.string('establishment').notNullable()
      table.string('role').notNullable()
      table.string('name').nullable()
      table.unique(['email', 'establishment', 'role'])
      table.index(['establishment'], 'mailbox_by_establishment')
      table.index(['role'], 'mailbox_by_role')
    }),
  ])

exports.down = (knex) => knex.schema.dropTable('notifications_config')
