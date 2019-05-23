const hash = require('string-hash')
const db = require('./dataAccess/db')
const { getIn } = require('../utils/functionalHelpers')

module.exports = {
  async tryLock(name) {
    return queryForLock(name, 'pg_try_advisory_lock')
  },

  async unlock(name) {
    return queryForLock(name, 'pg_advisory_unlock')
  },
}

async function queryForLock(name, lockFunction) {
  const identifier = hash(name)
  const query = { text: `select ${lockFunction}($1)`, values: [identifier] }
  const res = await db.query(query)
  return getIn(res, ['rows', [0], lockFunction])
}
