exports.up = async function up(knex) {
  await knex.schema.raw(`
    update licences set additional_conditions_version = 1
    where licence  -> 'licenceConditions' -> 'additional' is not null
`)
}

exports.down = async function down(knex) {
  await knex.schema.raw(`
  update licences set additional_conditions_version = null
`)
}
