exports.up = async function up(knex) {
  await knex.schema.createViewOrReplace('licences_excluding_deleted_view', (view) => {
    view.as(knex('licences').whereNull('deleted_at'))
  })
}

exports.down = async function down(knex) {
  await knex.schema.dropViewIfExists('licences_excluding_deleted_view')
}
