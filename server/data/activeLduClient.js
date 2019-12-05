const db = require('./dataAccess/db')

module.exports = {
  async addLdu(lduCode) {
    const query = {
      text: `INSERT INTO active_local_delivery_units (ldu_code) VALUES ($1) 
      ON CONFLICT (ldu_code) DO NOTHING`,
      values: [lduCode],
    }
    return db.query(query)
  },

  async isLduPresent(lduCode) {
    const query = {
      text: `SELECT count(*) FROM active_local_delivery_units WHERE ldu_code=$1`,
      values: [lduCode],
    }

    const { rows } = await db.query(query)
    return parseInt(rows[0].count, 10) > 0
  },
}
