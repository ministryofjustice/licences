exports.up = async function up(knex) {
  await knex.schema.alterTable('licence_migration_log', (table) => {
    table.renameColumn('licence_id', 'licence_version_id')
  })
}

exports.down = async function down(knex) {
  await knex.schema.alterTable('licence_migration_log', (table) => {
    table.renameColumn('licence_version_id', 'licence_id')
  })
}
