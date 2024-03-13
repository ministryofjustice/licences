exports.up = async (knex) => {
  await knex.raw(
    'ALTER TABLE licence_versions DROP CONSTRAINT licence_versions_booking_id_version_vary_version_unique;'
  )

  await knex.raw(
    `CREATE UNIQUE INDEX licence_versions_booking_id_version_vary_version_unique ON licence_versions (booking_id, version, vary_version) WHERE deleted_at is NULL;`
  )
}

exports.down = async (knex) => {
  await knex.raw(
    'ALTER TABLE licence_versions DROP CONSTRAINT licence_versions_booking_id_version_vary_version_unique;'
  )
  await knex.schema.table('licence_versions', (table) => {
    table.unique(['booking_id', 'version', 'vary_version'])
  })
}
