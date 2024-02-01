exports.up = async function up(knex) {
  await knex.schema.alterTable('licence_versions', (table) => {
    table.string('prison_number', 7).nullable()
  })
}

exports.down = async function down(knex) {
  await knex.schema.alterTable('licence_versions', (table) => {
    table.dropColumn('prison_number')
  })
}
