exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('LICENCES', table => {
            table.increments('ID').primary('PK_LICENCE');
            table.string('LICENCE').notNullable();
        }),
        knex.raw('ALTER TABLE [LICENCES] ALTER COLUMN [LICENCE] [NVARCHAR](MAX) NULL'),
        knex.raw('ALTER TABLE [LICENCES] ADD CONSTRAINT [LICENCES.LICENCE should be formatted as JSON] ' +
         'CHECK (ISJSON(LICENCE) > 0)')
    ]);

exports.down = knex =>
    knex.schema.dropTable('LICENCES');
