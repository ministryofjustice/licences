exports.up = knex =>
    Promise.all([
        knex.schema.table('CONDITIONS', table => {
            table.dropIndex('', 'CONDITION_BY_TYPE');
        }),
        knex.raw('ALTER TABLE [CONDITIONS] ALTER COLUMN [TEXT] [NVARCHAR](MAX)'),
        knex.raw(`CREATE INDEX CONDITION_BY_TYPE ON CONDITIONS (TYPE) INCLUDE (ID, TIMESTAMP, TEXT)
                WITH (ONLINE = ON);`)
    ]);

