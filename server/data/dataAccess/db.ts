import { Pool } from 'pg'
import fs from 'fs'

import logger from '../../../log'
import config from '../../config'

const pool = new Pool({
  user: config.db.username,
  host: config.db.server,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
  ssl:
    config.db.sslEnabled === 'true'
      ? {
          ca: fs.readFileSync('root.cert'),
          rejectUnauthorized: config.production,
        }
      : false,
})

pool.on('error', (error) => {
  logger.error('Unexpected error on idle client', error.stack)
})

export const query = (text, params?) => pool.query(text, params)

export const inTransaction = async (callback) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
