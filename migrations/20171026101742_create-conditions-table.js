exports.up = knex =>
    Promise.all([
        knex.schema.createTable('conditions', table => {
            table.string('id', 50).unique().primary('pk_conditions');
            table.date('timestamp').notNullable().defaultTo(knex.fn.now());
            table.string('type', 50).notNullable();
            table.text('text').notNullable();
            table.text('user_input');
            table.string('group', 50);
            table.string('subgroup', 50);
            table.boolean('active').defaultTo(0);
            table.index(['type', 'id', 'timestamp', 'text'], 'condition_by_type');
        })
    ]);

exports.down = knex =>
    knex.schema.dropTable('conditions');
