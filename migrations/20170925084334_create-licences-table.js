exports.up = knex =>
    Promise.all([
        knex.schema.createTable('licences', table => {
            table.increments('id').primary('pk_licence');
            table.jsonb('licence').nullable();
            table.string('nomis_id').notNullable();
            table.string('stage').notNullable();
            table.index(['nomis_id', 'id', 'stage'], 'licence_by_nomis_id');
        })
    ]);

exports.down = knex =>
    knex.schema.dropTable('licences');
