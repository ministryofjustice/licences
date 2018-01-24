exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('CONDITIONS_GROUPS', table => {
            table.integer('ID').primary('PK_CONDITIONS_GROUP');
            table.string('NAME');
            table.string('TYPE');
        })
    ]);

exports.down = knex =>
    knex.schema.dropTable('CONDITIONS_GROUPS');
