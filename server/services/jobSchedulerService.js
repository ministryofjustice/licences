const schedule = require('node-schedule')
const moment = require('moment')
const config = require('../config')
const logger = require('../../log.js')
const createJobUtils = require('./jobs/jobUtils')

module.exports = function createJobSchedulerService(dbLockingClient, notificationJobs) {
  const { autostart, overlapTimeout } = config.jobs

  const jobUtils = createJobUtils(dbLockingClient)

  function jobResultCallback(name) {
    return (error, result) => {
      if (error) {
        logger.warn(`Scheduled job: ${name}, finished with error`, error)
        outcomes[name] = { success: false, output: error.message }
        return
      }
      logger.info(`Scheduled job: ${name}, finished with success`, result)
      outcomes[name] = { success: true, output: JSON.stringify(result) }
    }
  }

  const jobs = [
    {
      name: 'roReminders',
      spec: config.jobs.roReminders,
      function: jobUtils.onceOnly(
        notificationJobs.roReminders,
        'roReminders',
        overlapTimeout,
        jobResultCallback('roReminders')
      ),
    },
  ]

  const executions = {}
  const outcomes = {}

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
        outcome: outcomes[job.name],
      }
    })
  }

  function cancelJob(jobName) {
    const job = jobs.find(j => j.name === jobName)
    if (job) {
      logger.info(`Cancelling job: ${job.name}`)
      const execution = executions[job.name]
      if (execution) {
        execution.cancel()
      }
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
