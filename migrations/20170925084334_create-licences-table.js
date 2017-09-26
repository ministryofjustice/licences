exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('LICENCES', table => {
            table.increments('ID').primary('PK_LICENCE');
            table.string('LICENCE').notNullable();
            table.string('NOMIS_ID').notNullable();
        }),
        knex.raw('ALTER TABLE [LICENCES] ALTER COLUMN [LICENCE] [NVARCHAR](MAX) NULL'),
        knex.raw('ALTER TABLE [LICENCES] ADD CONSTRAINT [LICENCES.LICENCE should be formatted as JSON] ' +
         'CHECK (ISJSON(LICENCE) > 0)'),
        knex.raw('CREATE INDEX LICENCE_BY_NOMIS_ID ON LICENCES (NOMIS_ID) INCLUDE (ID, LICENCE) WITH (ONLINE = ON);')
    ]);

exports.down = knex =>
    knex.schema.dropTable('LICENCES');
