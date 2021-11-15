exports.up = async function up(knex) {
  await knex.schema.alterTable('licences', (table) => {
    table.integer('conditions_version').nullable()
  })
}

exports.down = async function down(knex) {
  await knex.schema.alterTable('licences', (table) => {
    table.dropColumn('conditions_version')
  })
}
