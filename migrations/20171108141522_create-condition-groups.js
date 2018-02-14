exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('CONDITIONS_GROUPS', table => {
            table.string('ID', 50).primary('PK_CONDITIONS_GROUP');
            table.string('NAME');
            table.string('TYPE');
        })
    ]);

exports.down = knex =>
    knex.schema.dropTable('CONDITIONS_GROUPS');
