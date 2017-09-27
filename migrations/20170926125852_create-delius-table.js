exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('DELIUS', table => {
            table.string('OM_ID', 8).notNullable().primary('PK_DELIUS');
            table.string('OFFENDERS').notNullable();
        }),
        knex.raw('ALTER TABLE [DELIUS] ALTER COLUMN [OFFENDERS] [NVARCHAR](MAX) NULL'),
        knex.raw('ALTER TABLE [DELIUS] ADD CONSTRAINT [DELIUS.OFFENDERS should be formatted as JSON] ' +
            'CHECK (ISJSON(OFFENDERS) > 0)')
    ]);

exports.down = knex =>
    knex.schema.dropTable('DELIUS');
