exports.up = async function up(knex) {
    await knex.schema.alterTable('licence_migration_log', (table) => {
        table.bigInteger('licence_version_id').nullable().alter()
    })
}

exports.down = async function down(knex) {
    await knex.schema.alterTable('licence_migration_log', (table) => {
        table.bigInteger('licence_version_id').notNullable().alter()
    })
}