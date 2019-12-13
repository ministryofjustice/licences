/**
 * @typedef {import('../../types/licences').WarningClient} WarningClient
 */

const db = require('./dataAccess/db')

/**
 * @type { WarningClient }
 */
const WarningClient = {
  async raiseWarning(bookingId, code, messsage) {
    const query = {
      text: `INSERT INTO warnings (booking_id, code, message, acknowledged) VALUES ($1, $2, $3, false) ON CONFLICT (booking_id) DO NOTHING`,
      values: [bookingId, code, messsage],
    }
    return db.query(query)
  },

  async acknowledgeWarning(errorId) {
    const query = {
      text: `UPDATE warnings SET acknowledged = true WHERE id=$1`,
      values: [errorId],
    }

    const { rows } = await db.query(query)
    return parseInt(rows[0].count, 10) > 0
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
    return db.query(query).rows
  },

  getAcknowledgedWarnings() {
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
    return db.query(query).rows
  },
}

module.exports = WarningClient
