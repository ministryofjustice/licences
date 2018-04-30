exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('conditions_groups', table => {
            table.string('id', 50).primary('pk_conditions_group');
            table.string('name');
            table.string('type');
        })
    ]);

exports.down = knex =>
    knex.schema.dropTable('conditions_groups');
