exports.up = (knex) =>
    Promise.all([
        knex.schema.createTable('licence_migration_log', (table) => {
            table.bigIncrements('id').primary('pk_licence_migration_log')
            table.bigInteger('licence_id').notNullable()
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.index(['licence_id'], 'idx_licence_migration_log_licence_id')
        }),
    ])

exports.down = (knex) => knex.schema.dropTable('licence_migration_log')
