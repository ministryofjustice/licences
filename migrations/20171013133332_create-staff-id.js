exports.up = knex =>
    Promise.all([
        knex.schema.createTable('staff_ids', table => {
            table.string('nomis_id', 255).primary('pk_staff_id')
            table.string('staff_id', 255).notNullable()
            table.string('first_name').nullable()
            table.string('last_name').nullable()
            table.string('organisation').nullable()
            table.string('job_role').nullable()
            table.string('email').nullable()
            table.string('org_email').nullable()
            table.string('telephone').nullable()
        }),
    ])

exports.down = knex => knex.schema.dropTable('staff_ids')
