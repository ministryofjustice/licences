exports.up = async (knex) => {
  await knex.schema.alterTable('staff_ids', (table) => {
    table.boolean('deleted').notNullable().defaultTo(false)
  })
  await knex.schema.raw('CREATE VIEW v_staff_ids AS SELECT * FROM staff_ids where deleted is false;')
}

exports.down = async (knex) => {
  await knex.schema.raw('DROP VIEW v_staff_ids')
  await knex.schema.alterTable('staff_ids', (table) => {
    table.dropColumn('deleted')
  })
}
