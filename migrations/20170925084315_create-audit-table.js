exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('audit', table => {
            table.increments('id').primary('pk_audit');
            table.date('timestamp').notNullable().defaultTo(knex.fn.now());
            table.string('user', 50).notNullable();
            table.string('action', 50).notNullable();
            table.jsonb('details').nullable();
        })
    ]);

exports.down = knex =>
    knex.schema.dropTable('audit');
