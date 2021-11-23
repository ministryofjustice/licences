exports.up = async function up(knex) {
  await knex.schema.alterTable('licences', (table) => {
    table.renameColumn('conditions_version', 'additional_conditions_version')
  })
}

exports.down = async function down(knex) {
  await knex.schema.alterTable('licences', (table) => {
    table.renameColumn('additional_conditions_version', 'conditions_version')
  })
}
