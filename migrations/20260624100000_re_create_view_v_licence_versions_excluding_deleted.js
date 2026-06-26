exports.up = async function (knex) {
  await knex.raw(`
    CREATE OR REPLACE VIEW v_licence_versions_excluding_deleted AS
      SELECT  * FROM licence_versions WHERE deleted_at IS NULL
  `)
}

exports.down = async function (knex) {
  await knex.raw(`
    CREATE OR REPLACE VIEW v_licence_versions_excluding_deleted AS
      SELECT  * FROM licence_versions WHERE deleted_at IS NULL
  `)
}
