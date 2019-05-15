const schedule = require('node-schedule')
const advisoryLock = require('advisory-lock').default
const moment = require('moment')
const config = require('../config')
const logger = require('../../log.js')
const { onceOnly } = require('./jobs/jobUtils')

module.exports = function createJobSchedulerService(notificationJobs) {
  const connectionString = `postgres://${config.db.username}:${config.db.password}@${config.db.server}:${
    config.db.port
  }/${config.db.database}`

  const { autostart, overlapTimeout } = config.jobs

  const roLock = advisoryLock(connectionString)('roReminders')

  const jobs = [
    {
      name: 'roReminders',
      spec: config.jobs.roReminders,
      lock: roLock,
      function: onceOnly(notificationJobs.roReminders, roLock, 'roReminders', overlapTimeout),
    },
  ]

  const executions = {}

  function nextExecution(job) {
    if (!job) {
      return null
    }
    const next = job.nextInvocation()
    return next ? moment(next.toDate()).format('dddd Do MMMM HH:mm:ss') : null
  }

  function listJobs() {
    return jobs.map(job => {
      return {
        name: job.name,
        schedule: job.spec,
        next: nextExecution(executions[job.name]),
      }
    })
  }

  function cancelJob(jobName) {
    const job = jobs.find(j => j.name === jobName)
    if (job) {
      logger.info(`Cancelling job: ${job.name}`)
      executions[job.name].cancel()
    }
  }

  function cancelAllJobs() {
    jobs.forEach(job => {
      logger.info(`Cancelling job: ${job.name}`)
      executions[job.name].cancel()
    })
  }

  function startAllJobs() {
    jobs.forEach(job => {
      activate(job)
    })
  }

  function startJob(jobName) {
    const job = jobs.find(j => j.name === jobName)
    if (job) {
      activate(job)
    }
  }

  function activate(job) {
    logger.info(`Scheduling job: ${job.name}`)
    if (executions[job.name]) {
      executions[job.name].reschedule(job.spec)
    } else {
      executions[job.name] = schedule.scheduleJob(job.name, job.spec, job.function)
    }
  }

  if (autostart) {
    logger.info('Auto-starting scheduled jobs')
    startAllJobs()
  }

  return {
    listJobs,
    startAllJobs,
    startJob,
    cancelAllJobs,
    cancelJob,
  }
}
