exports.up = async function up(knex) {
  await knex.schema.alterTable('licences', (table) => {
    table.integer('standard_conditions_version').nullable()
  })
}

exports.down = async function down(knex) {
  await knex.schema.alterTable('licences', (table) => {
    table.dropColumn('standard_conditions_version')
  })
}
