exports.up = async function (knex) {
  await knex.schema.alterTable('staff_ids', (table) => {
    table.bigInteger('staff_identifier').nullable().comment('Delius staff identifier (not staff code)')
  })
  await knex.schema.raw('CREATE OR REPLACE VIEW v_staff_ids AS SELECT * FROM staff_ids where deleted is false;')
}

exports.down = async function (knex) {
  await knex.schema.alterTable('staff_ids', (table) => {
    table.dropColumn('staff_identifier')
  })
  await knex.schema.raw('CREATE OR REPLACE VIEW v_staff_ids AS SELECT * FROM staff_ids where deleted is false;')
}
