exports.up = knex =>
    Promise.all([
        knex.raw('ALTER TABLE [STAFF_IDS] ALTER COLUMN [STAFF_ID] [NVARCHAR](255)'),
        knex.schema.table('STAFF_IDS', table => {
            table.dropColumn('STAFF_NAME');
            table.string('FIRST_NAME').nullable();
            table.string('LAST_NAME').nullable();
        })
    ]);

exports.down = knex =>
    Promise.all([
        knex.raw('ALTER TABLE [STAFF_IDS] ALTER COLUMN [STAFF_ID] [NVARCHAR](8)'),
        knex.schema.table('STAFF_IDS', table => {
            table.string('STAFF_NAME').nullable();
            table.dropColumn('FIRST_NAME');
            table.dropColumn('LAST_NAME');
        })
    ]);
