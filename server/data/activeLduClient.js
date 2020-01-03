const db = require('./dataAccess/db')

module.exports = {
  async addLdu(lduCode, probationAreaCode) {
    const query = {
      text: `INSERT INTO active_local_delivery_units (ldu_code, probation_area_code) VALUES ($1, $2) 
      ON CONFLICT (ldu_code) DO NOTHING`,
      values: [lduCode, probationAreaCode],
    }
    return db.query(query)
  },

  async isLduPresent(lduCode, probationAreaCode) {
    const query = {
      text: `SELECT count(*) FROM active_local_delivery_units WHERE ldu_code=$1 AND probation_area_code=$2`,
      values: [lduCode, probationAreaCode],
    }

    const { rows } = await db.query(query)
    return parseInt(rows[0].count, 10) > 0
  },
}
