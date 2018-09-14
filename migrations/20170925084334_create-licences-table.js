exports.up = knex =>
    Promise.all([
        knex.schema.createTable('licences', table => {
            table.increments('id').primary('pk_licence');
            table.jsonb('licence').nullable();
            table.integer('booking_id').notNullable();
            table.string('stage').notNullable();
            table.integer('version').notNullable();
            table.index(['booking_id', 'id', 'stage', 'version'], 'licence_by_booking_id');
            table.datetime('transition_date');
        })
    ]);

exports.down = knex =>
    knex.schema.dropTable('licences');
