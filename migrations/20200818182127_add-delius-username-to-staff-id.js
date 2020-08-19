exports.up = async (knex) => {
  await knex.schema.alterTable('staff_ids', (table) => {
    table.string('delius_username').nullable()
  })
  await knex.schema.raw('CREATE OR REPLACE VIEW v_staff_ids AS SELECT * FROM staff_ids where deleted is false;')
}

exports.down = async (knex) => {
  await knex.schema.alterTable('staff_ids', (table) => {
    table.dropColumn('delius_username')
  })
  await knex.schema.raw('CREATE OR REPLACE VIEW v_staff_ids AS SELECT * FROM staff_ids where deleted is false;')
}
