exports.up = knex =>
    Promise.all([
        knex.schema.createTableIfNotExists('CONDITIONS_UI', table => {
            table.increments('ID').primary('PK_CONDITIONS_UI');
            table.string('UI_ID');
            table.string('FIELD_POSITION').notNullable();
        }),
        knex.raw('ALTER TABLE [CONDITIONS_UI] ALTER COLUMN [FIELD_POSITION] [NVARCHAR](MAX) NULL'),
        knex.raw('ALTER TABLE [CONDITIONS_UI] ADD CONSTRAINT [CONDITIONS_UI.FIELD_POSITION ' +
            'should be formatted as JSON] CHECK (ISJSON(FIELD_POSITION) > 0)')
    ]);

exports.down = knex =>
    knex.schema.dropTable('CONDITIONS_UI');
