/**
 * @typedef {import('../../types/licences').ActiveLduClient} ActiveLduClient
 */
const format = require('pg-format')
const db = require('./dataAccess/db')

/**
 * @type {ActiveLduClient}
 */
const activeLduClient = {
  async isLduPresent(lduCode, probationAreaCode) {
    const query = {
      text: `SELECT count(*) FROM active_local_delivery_units WHERE ldu_code=$1 AND probation_area_code=$2`,
      values: [lduCode, probationAreaCode],
    }

    const { rows } = await db.query(query)
    return parseInt(rows[0].count, 10) > 0
  },

  async allActiveLdusInArea(probationAreaCode) {
    const query = {
      text: `SELECT ldu_code "code" FROM active_local_delivery_units WHERE probation_area_code=$1`,
      values: [probationAreaCode],
    }

    const { rows } = await db.query(query)
    return rows
  },

  async updateActiveLdu(probationAreaCode, activeLduCodes) {
    await db.inTransaction(async (client) => {
      await client.query({
        text: `DELETE FROM active_local_delivery_units WHERE probation_area_code = $1`,
        values: [probationAreaCode],
      })

      const rows = activeLduCodes.map((code) => [probationAreaCode, code])

      if (rows.length > 0) {
        await client.query({
          text: format(`INSERT INTO active_local_delivery_units (probation_area_code, ldu_code) VALUES %L`, rows),
        })
      }
    })
  },
}

module.exports = activeLduClient
