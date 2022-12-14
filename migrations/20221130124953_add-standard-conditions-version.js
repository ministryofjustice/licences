exports.up = async function up(knex) {
  await knex.schema.raw(`ALTER TABLE licences ADD standard_conditions_version INTEGER;`)
}

exports.down = async function down(knex) {
  await knex.schema.raw(`ALTER TABLE licences DROP standard_conditions_version;`)
}
