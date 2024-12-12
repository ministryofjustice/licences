exports.up = (knex) =>
  Promise.all([
    knex.schema.table('licence_versions', (table) => {
      table.boolean('licence_in_cvl').notNull().defaultTo(false)
    }),
    knex.schema.raw(
      'CREATE OR REPLACE VIEW v_licences_excluding_deleted AS SELECT * FROM licences where deleted_at is null;'
    ),
    knex.schema.raw(
      'CREATE OR REPLACE VIEW v_licence_versions_excluding_deleted AS SELECT * FROM licence_versions where deleted_at is null;'
    ),
  ])

exports.down = (knex) =>
  Promise.all([
    knex.schema.table('licence_versions', (table) => {
      table.dropColumn('licence_in_cvl')
    }),
    knex.schema.raw(
      'CREATE OR REPLACE VIEW v_licences_excluding_deleted AS SELECT * FROM licences where deleted_at is null;'
    ),
    knex.schema.raw(
      'CREATE OR REPLACE VIEW v_licence_versions_excluding_deleted AS SELECT * FROM licence_versions where deleted_at is null;'
    ),
  ])
