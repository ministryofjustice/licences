const fs = require('fs')
const config = require('./server/config')

module.exports = {
  // knex-migrate doesn't work unless this is here
  client: 'pg',
  connection: {
    host: config.db.server,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
    ssl:
      config.db.sslEnabled === 'true'
        ? {
            ca: fs.readFileSync('root.cert'),
            rejectUnauthorized: config.production,
          }
        : false,
  },
  migrations: {
    directory: 'app/dist/migrations',
  },
  acquireConnectionTimeout: 5000,

  // don't really need this - could just use the above?
  standard: {
    client: 'pg',
    connection: {
      host: config.db.server,
      user: config.db.username,
      password: config.db.password,
      database: config.db.database,
      ssl: config.db.sslEnabled === 'true',
    },
    acquireConnectionTimeout: 5000,
  },
  demo: {
    client: 'pg',
    connection: {
      host: config.db.server,
      user: config.db.username,
      password: config.db.password,
      database: config.db.database,
      ssl: config.db.sslEnabled === 'true',
    },
    acquireConnectionTimeout: 5000,
    seeds: {
      directory: './seeds/demo',
    },
  },
}
