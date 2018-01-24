exports.up = knex =>
    Promise.all([
        knex.raw('ALTER TABLE [STAFF_IDS] ALTER COLUMN [NOMIS_ID] [NVARCHAR](255)')
    ]);

exports.down = knex =>
    Promise.all([
        knex.raw('ALTER TABLE [STAFF_IDS] ALTER COLUMN [NOMIS_ID] [NVARCHAR](8)')
    ]);
