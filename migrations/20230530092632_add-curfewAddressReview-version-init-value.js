exports.up = async function up(knex) {
  await knex.schema.raw(`
      update licences set licence = jsonb_set(licence,'{curfew, curfewAddressReview, version}','"1"')
      where licence -> 'curfew' -> 'curfewAddressReview' ->> 'version' is null
  `)
}

exports.down = async function down(knex) {
  await knex.schema.raw(`
      update licences set licence = licence #- '{curfew, curfewAddressReview, version'
      where licence -> 'curfew' -> 'curfewAddressReview' ->> 'version' = '"1"'
  `)
}
