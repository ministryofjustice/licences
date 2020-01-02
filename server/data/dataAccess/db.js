const { Pool } = require('pg')
const fs = require('fs')

const logger = require('../../../log')
const config = require('../../config')

const pool = new Pool({
  user: config.db.username,
  host: config.db.server,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
  ssl:
    config.production && config.db.sslEnabled === 'true'
      ? {
          ca: fs.readFileSync('root.cert'),
          rejectUnauthorized: true,
        }
      : false,
})

pool.on('error', error => {
  logger.error('Unexpected error on idle client', error.stack)
})

module.exports = {
  query: (text, params) => pool.query(text, params),
}
