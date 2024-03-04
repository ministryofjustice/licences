exports.up = async function up(knex) {
  await knex.schema.raw(`ALTER TABLE licence_versions ADD deleted_at TIMESTAMP;`)
}

exports.down = async function down(knex) {
  await knex.schema.raw(`ALTER TABLE licence_versions DROP deleted_at;`)
}
