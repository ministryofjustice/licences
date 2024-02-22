exports.up = async function up(knex) {
  await knex.schema.createViewOrReplace('v_licences_excluding_deleted', (view) => {
    view.as(knex('licences').whereNull('deleted_at'))
  })
}

exports.down = async function down(knex) {
  await knex.schema.dropViewIfExists('v_licences_excluding_deleted')
}
