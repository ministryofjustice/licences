exports.up = knex =>
    Promise.all([
        knex.schema.dropTableIfExists('conditions'),
        knex.schema.dropTableIfExists('conditions_ui'),
        knex.schema.dropTableIfExists('conditions_groups')
    ]);


exports.down = knex =>
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
        }),
        knex.schema.createTable('conditions_ui', table => {
            table.increments('id').primary('pk_conditions_ui');
            table.string('ui_id');
            table.jsonb('field_position').nullable();
        }),
        knex.schema.createTable('conditions_groups', table => {
            table.string('id', 50).primary('pk_conditions_group');
            table.string('name');
            table.string('type');
        })
    ]);
