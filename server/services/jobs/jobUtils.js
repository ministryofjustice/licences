const logger = require('../../../log.js')

module.exports = {
  onceOnly,
}

function onceOnly(jobFunction, jobLock, jobName, overlapTimeout) {
  return async () => {
    const lock = jobLock.tryLock()
    if (lock) {
      logger.info(`${jobName}: Obtained lock`)
      return runJob(jobFunction, jobLock, jobName, overlapTimeout)
    }

    logger.info(`${jobName}: Could not obtain lock`)
  }
}

async function runJob(jobFunction, jobLock, jobName, overlapTimeout) {
  try {
    await jobFunction()
    await delay(overlapTimeout)
  } catch (error) {
    logger.error(`${jobName}: Error:`, error.stack)
  }
  jobLock.unlock()
}

async function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
