exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('CONDITIONS', table => {
            table.increments('ID').primary('PK_CONDITIONS');
            table.date('TIMESTAMP').notNullable().defaultTo(knex.fn.now());
            table.string('TYPE', 50).notNullable();
            table.string('TEXT').notNullable();
        }),
        knex.raw(`CREATE INDEX CONDITION_BY_TYPE ON CONDITIONS (TYPE) INCLUDE (ID, TIMESTAMP, TEXT)
                WITH (ONLINE = ON);`)
    ]);

exports.down = knex =>
    knex.schema.dropTable('CONDITIONS');
