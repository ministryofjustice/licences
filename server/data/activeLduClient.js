const db = require('./dataAccess/db')

module.exports = {
  async addLdu(lduCode) {
    const query = {
      text: `INSERT INTO active_local_delivery_units (ldu_code) VALUES ($1) ON CONFLICT (ldu_code) DO UPDATE SET ldu_code=active_local_delivery_units.ldu_code RETURNING ldu_code`,
      values: [lduCode],
    }
    const response = await db.query(query)
    return response
  },

  async doesLduExist(lduCode) {
    const query = {
      text: `SELECT ldu_code FROM active_local_delivery_units WHERE ldu_code=$1`,
      values: [lduCode],
    }

    const response = await db.query(query)
    const active = response && response.rows
    return active ? 'true' : 'false'
  },
}
