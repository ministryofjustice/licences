exports.up = knex =>
    Promise.all([
        knex.schema.createTable('licence_versions', table => {
            table.increments('id').primary('pk_licence');
            table.timestamp('timestamp').notNullable().defaultTo(knex.fn.now());
            table.jsonb('licence').nullable();
            table.string('nomis_id').notNullable();
            table.integer('version').notNullable();
            table.index(['nomis_id', 'version', 'id'], 'licence_version_by_nomis_id');
            table.unique(['nomis_id', 'version']);
        })
    ]);

exports.down = knex =>
    knex.schema.dropTable('licence_versions');
