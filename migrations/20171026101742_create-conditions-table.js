exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('CONDITIONS', table => {
            table.string('ID', 50).unique().primary('PK_CONDITIONS');
            table.date('TIMESTAMP').notNullable().defaultTo(knex.fn.now());
            table.string('TYPE', 50).notNullable();
            table.string('TEXT').notNullable();
            table.string('USER_INPUT');
            table.string('GROUP', 50);
            table.string('SUBGROUP', 50);
            table.bit('ACTIVE').defaultTo(0);
        }),
        knex.raw(`CREATE INDEX CONDITION_BY_TYPE ON CONDITIONS (TYPE) INCLUDE (ID, TIMESTAMP, TEXT, USER_INPUT);`)
    ]);

exports.down = knex =>
    knex.schema.dropTable('CONDITIONS');
