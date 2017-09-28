exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('DELIUS', table => {
            table.string('STAFF_ID', 8).notNullable();
            table.string('STAFF_NAME').notNullable();
            table.string('TEAM').notNullable();
            table.string('PROVIDER').notNullable();
            table.string('SURNAME').notNullable();
            table.string('FIRST_NAME').notNullable();
            table.string('NOMS_NO').notNullable();
            table.string('CRN').notNullable();
        })
    ]);

exports.down = knex =>
    knex.schema.dropTable('DELIUS');
