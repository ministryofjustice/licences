exports.up = async function up(knex) {
  await knex.schema.raw(`
      CREATE INDEX audit_by_booking_id ON audit (((details ->> 'bookingId')))
    `)
}

exports.down = async function down(knex) {
  await knex.schema.raw(`
      DROP INDEX audit_by_booking_id
    `)
}
