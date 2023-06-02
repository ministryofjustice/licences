exports.up = async function up(knex) {
  await knex.schema.raw(`
        update licences set licence = jsonb_set(licence,'{finalChecks, postpone, version}','"1"')
        where licence -> 'finalChecks' -> 'postpone' ->> 'version' is null
    `)
}

exports.down = async function down(knex) {
  await knex.schema.raw(`
        update licences set licence = licence #- '{finalChecks, postpone, version}'
        where licence -> 'finalChecks' -> 'postpone' ->> 'version' = '"1"'
    `)
}
