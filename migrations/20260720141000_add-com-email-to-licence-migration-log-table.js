exports.up = async function up(knex) {
  await knex.schema.alterTable('licence_migration_log', (table) => {
    table.string('community_offender_manager_email').nullable()
  })
}

exports.down = async function down(knex) {
  await knex.schema.alterTable('licence_migration_log', (table) => {
    table.dropColumn('community_offender_manager_email')
  })
}
