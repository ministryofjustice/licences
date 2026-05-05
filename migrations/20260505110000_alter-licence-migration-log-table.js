exports.up = async (knex) => {
  await knex.raw(
    'ALTER TABLE licence_migration_log ADD COLUMN success BOOLEAN;'
  )

  await knex.raw(
    'ALTER TABLE licence_migration_log ADD COLUMN retry BOOLEAN;'
  )

  await knex.raw(
    'ALTER TABLE licence_migration_log ADD COLUMN message TEXT;'
  )

  await knex.raw(
    'CREATE TYPE migration_error_source AS ENUM (\'CVL\', \'HDC\');'
  )

  await knex.raw(
    'ALTER TABLE licence_migration_log ADD COLUMN error_source migration_error_source;'
  )
}

exports.down = async (knex) => {
  await knex.raw(
    'ALTER TABLE licence_migration_log DROP COLUMN success;'
  )

  await knex.raw(
    'ALTER TABLE licence_migration_log DROP COLUMN retry;'
  )

  await knex.raw(
    'ALTER TABLE licence_migration_log DROP COLUMN message;'
  )

  await knex.raw(
    'ALTER TABLE licence_migration_log DROP COLUMN error_source;'
  )

  await knex.raw(
    'DROP TYPE migration_error_source;'
  )
}
