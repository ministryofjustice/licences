exports.up = knex =>
  Promise.all([
    knex.schema
      .table('staff_ids', table => {
        table
          .boolean('auth_onboarded')
          .notNull()
          .defaultTo(0)
      })
      .then(() => {
        return knex('staff_ids').update({ auth_onboarded: 1 })
      }),
  ])

exports.down = knex =>
  Promise.all([
    knex.schema.table('staff_ids', table => {
      table.dropColumn('auth_onboarded')
    }),
  ])
