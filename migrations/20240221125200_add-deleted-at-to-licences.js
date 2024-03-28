exports.up = async function up(knex) {
  await knex.schema.raw(`ALTER TABLE licences ADD deleted_at TIMESTAMP;`)
}

exports.down = async function down(knex) {
  await knex.schema.raw(`ALTER TABLE licences DROP deleted_at;`)
}
