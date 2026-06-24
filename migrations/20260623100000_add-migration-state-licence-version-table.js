exports.up = async function up(knex) {
    await knex.schema.alterTable('licence_versions', (table) => {
        table
            .string('migration_state', 20)
            .notNullable()
            .defaultTo('PENDING')

        table.check(
            "migration_state IN ('PENDING', 'COMPLETED', 'FAILED')",
            [],
            'licence_versions_migration_state_check',
        )
    })
}

exports.down = async function down(knex) {
    await knex.schema.alterTable('licence_versions', (table) => {
        table.dropColumn('migration_state')
    })
}