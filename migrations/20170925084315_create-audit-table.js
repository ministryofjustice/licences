exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('AUDIT', table => {
            table.increments('ID').primary('PK_AUDIT');
            table.date('TIMESTAMP').notNullable().defaultTo(knex.fn.now());
            table.string('USER', 50).notNullable();
            table.string('ACTION', 50).notNullable();
            table.string('DETAILS').notNullable();
        }),
        knex.raw('ALTER TABLE [AUDIT] ALTER COLUMN [DETAILS] [NVARCHAR](2056) NULL'),
        knex.raw('ALTER TABLE [AUDIT] ADD CONSTRAINT [AUDIT.DETAILS should be formatted as JSON] ' +
         'CHECK (ISJSON(DETAILS) > 0)')
    ]);

exports.down = knex =>
    knex.schema.dropTable('AUDIT');
