exports.up = knex =>
    Promise.all([

        // Add status column (Just a string. App code can enforce correct values)
        knex.schema.table('LICENCES', table => {
            table.string('STATUS').nullable();
        }),

        // Set default value (UNSTARTED wouldn't even be in the DB)
        knex('LICENCES').update('STATUS', 'STARTED'),

        // Make it non-nullable
        knex.schema.table('LICENCES', table => {
            table.string('STATUS').notNull().alter();
        }),

        // Drop the old index
        knex.schema.table('LICENCES', table => {
            table.dropIndex('', 'LICENCE_BY_NOMIS_ID');
        }),

        // Make the index include the status
        knex.raw(`CREATE INDEX LICENCE_BY_NOMIS_ID ON LICENCES (NOMIS_ID) 
                    INCLUDE (ID, LICENCE, STATUS) WITH (ONLINE = ON);`)
    ]);

exports.down = knex =>
    Promise.all([

        // Drop the new index
        knex.schema.table('LICENCES', table => {
            table.dropIndex('', 'LICENCE_BY_NOMIS_ID');
        }),

        // Drop the new column
        knex.schema.table('LICENCES', table => {
            table.dropColumn('STATUS');
        }),

        // Recreate the original index
        knex.raw('CREATE INDEX LICENCE_BY_NOMIS_ID ON LICENCES (NOMIS_ID) INCLUDE (ID, LICENCE) WITH (ONLINE = ON);')
    ]);

