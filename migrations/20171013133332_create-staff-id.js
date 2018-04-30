exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('staff_ids', table => {
            table.string('nomis_id', 255).notNullable();
            table.string('staff_id', 255).notNullable();
            table.string('first_name').nullable();
            table.string('last_name').nullable();
        })
    ]);

exports.down = knex =>
    knex.schema.dropTable('staff_ids');
