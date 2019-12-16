/**
 * @typedef {import('../../types/licences').WarningClient} WarningClient
 */

const format = require('pg-format')
const db = require('./dataAccess/db')

/**
 * @type { WarningClient }
 */
const WarningClient = {
  async raiseWarning(bookingId, code, messsage) {
    const query = {
      text: `INSERT INTO warnings (booking_id, code, message, acknowledged) VALUES ($1, $2, $3, false) 
      ON CONFLICT (booking_id, code) where acknowledged = false DO NOTHING`,
      values: [bookingId, code, messsage],
    }
    return db.query(query)
  },

  async acknowledgeWarnings(errorIds) {
    const query = {
      text: format(`UPDATE warnings SET acknowledged = true WHERE id in (%L)`, errorIds),
    }

    const { rowCount } = await db.query(query)
    return rowCount
  },

  async getOutstandingWarnings() {
    const query = {
      text: `SELECT id
      ,      booking_id "bookingId"
      ,      timestamp 
      ,      code
      ,      message
      FROM warnings   
      where acknowledged = false
      ORDER BY timestamp DESC
      LIMIT 500`,
    }
    const { rows } = await db.query(query)
    return rows
  },

  async getAcknowledgedWarnings() {
    const query = {
      text: `SELECT id
      ,      booking_id "bookingId"
      ,      timestamp 
      ,      code
      ,      message
      FROM warnings   
      where acknowledged = true
      ORDER BY timestamp DESC
      LIMIT 500`,
    }
    const { rows } = await db.query(query)
    return rows
  },
}

module.exports = WarningClient
