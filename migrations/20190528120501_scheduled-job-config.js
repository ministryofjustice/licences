exports.up = knex =>
  Promise.all([
    knex.schema.createTable('job_config', table => {
      table.increments('id').primary('pk_jobs')
      table.string('name').notNullable()
      table.string('spec').notNullable()
    }),
  ])

exports.down = knex => knex.schema.dropTable('job_config')
