const hash = require('string-hash')
const logger = require('../../../log.js')
const db = require('../../data/dataAccess/db')
const { getIn } = require('../../utils/functionalHelpers')

module.exports = {
  onceOnly,
}

function onceOnly(jobFunction, name, overlapTimeout, callback) {
  return async () => {
    try {
      const result = await withLock(jobFunction, name, overlapTimeout)
      callback(null, result)
    } catch (error) {
      callback(error, null)
    }
  }
}

async function withLock(jobFunction, name, overlapTimeout) {
  try {
    logger.info(`Trying lock for: ${name}`)
    const locked = await tryLock(name)
    if (locked) {
      logger.info(`${name}: Obtained lock`)
      const result = await jobFunction()
      await delay(overlapTimeout)
      return result
    }

    logger.info(`${name}: Could not obtain lock`)
    return 'MISSED_LOCK'
  } catch (error) {
    logger.error(`Error running job: ${name}:`, error)
    throw error
  } finally {
    await unlock(name)
  }
}

async function tryLock(name) {
  return queryForLock(name, 'pg_try_advisory_lock')
}

async function unlock(name) {
  return queryForLock(name, 'pg_advisory_unlock')
}

async function queryForLock(name, lockFunction) {
  const identifier = hash(name)
  const query = { text: `select ${lockFunction}($1)`, values: [identifier] }
  const res = await db.query(query)
  return getIn(res, ['rows', [0], lockFunction])
}

async function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
