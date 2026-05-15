exports.up = async function up(knex) {
  await knex.schema.raw(`ALTER TABLE licence_migration_log ADD booking_id INTEGER;`)
}

exports.down = async function down(knex) {
  await knex.schema.raw(`ALTER TABLE licence_migration_log DROP booking_id;`)
}