const logger = require('../../../log')

module.exports = function createJobUtils(dbLockingClient) {
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
      const locked = await dbLockingClient.tryLock(name)
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
      await dbLockingClient.unlock(name)
    }
  }

  async function delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  return {
    onceOnly,
  }
}
