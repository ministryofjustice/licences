exports.up = async function up(knex) {
  await knex.schema.alterTable('licence_migration_log', (table) => {
    table
      .enu('migration_trigger', ['USER', 'BATCH', 'EVENT'], {
        useNative: true,
        enumName: 'migration_trigger_enum',
      })
      .notNullable()
      .defaultTo('USER')
  })
}

exports.down = async function down(knex) {
  await knex.schema.alterTable('licence_migration_log', (table) => {
    table.dropColumn('migration_trigger')
  })

  await knex.raw('DROP TYPE IF EXISTS migration_trigger_enum')
}
