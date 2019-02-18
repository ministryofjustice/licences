exports.up = knex =>
    Promise.all([
        knex.schema.createTable('audit', table => {
            table.increments('id').primary('pk_audit')
            table
                .timestamp('timestamp')
                .notNullable()
                .defaultTo(knex.fn.now())
            table.string('user', 50).notNullable()
            table.string('action', 50).notNullable()
            table.jsonb('details').nullable()
        }),
    ])

exports.down = knex => knex.schema.dropTable('audit')
