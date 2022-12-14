exports.up = async function up(knex) {
  await knex.schema.raw(`
    update licences set licence = licence #- '{risk, riskManagement, version}'
    where licence -> 'risk' -> 'riskManagement' ->> 'version' = '"1"'
`)
}

exports.down = async function down(knex) {
  await knex.schema.raw(`
    update licences set licence = licence #- '{risk, riskManagement, version}'
    where licence -> 'risk' -> 'riskManagement' ->> 'version' = '"1"'
`)
}
