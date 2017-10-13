exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('STAFF_IDS', table => {
            table.string('NOMIS_ID', 8).notNullable();
            table.string('STAFF_ID', 8).notNullable();
            table.string('STAFF_NAME').notNullable();
        })
    ]);

exports.down = knex =>
    knex.schema.dropTable('STAFF_IDS');
