exports.up = async function up(knex) {
  await knex.schema.createViewOrReplace('v_licence_versions_excluding_deleted', (view) => {
    view.as(knex('licence_versions').whereNull('deleted_at'))
  })
}

exports.down = async function down(knex) {
  await knex.schema.dropViewIfExists('v_licence_versions_excluding_deleted')
}
