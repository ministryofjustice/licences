const moment = require('moment')
const createJobSchedulerService = require('../../server/services/jobSchedulerService')
const createNotificationJobs = require('../../server/services/jobs/notificationJobs')

describe('jobSchedulerService', () => {
  describe('createScheduledJobs', () => {
    let service
    let jobs
    let signInService
    let reminderService
    let dbLockingClient
    let configClient
    const jobSpec = '* * * * * *'

    beforeEach(() => {
      signInService = {
        getClientCredentialsTokens: jest.fn().mockReturnValue({ token: 'system-user-token' }),
      }

      reminderService = {
        notifyRoReminders: jest.fn().mockReturnValue({}),
      }

      dbLockingClient = {
        query: jest.fn().mockReturnValue({}),
      }

      configClient = {
        getJobSpec: jest.fn().mockReturnValue(jobSpec),
      }

      jobs = createNotificationJobs(reminderService, signInService)
      service = createJobSchedulerService(dbLockingClient, configClient, jobs)
      service.startAllJobs()
    })

    afterEach(() => {
      service.cancelAllJobs()
    })

    test('should list jobs', async () => {
      const jobList = await service.listJobs()
      expect(jobList.length).toBe(1)
    })

    test('should create RO reminders job', async () => {
      const jobList = await service.listJobs()
      const job = jobList[0]
      expect(job.name).toBe('roReminders')
      expect(job.schedule).toEqual(jobSpec)
      expect(moment(job.next, 'dddd Do MMMM HH:mm:ss').isValid()).toBe(true)
      expect(job.outcome).toEqual(undefined)
    })

    test('should cancel job and remove next execution', async () => {
      const jobList = await service.listJobs()
      const jobName = jobList[0].name
      expect(jobList[0].next).not.toBe(null)
      service.cancelJob(jobName)

      const endJobsList = await service.listJobs()
      expect(endJobsList[0].next).toBe(null)
    })

    test('should restart job and set next execution', async () => {
      const jobList = await service.listJobs()
      const jobName = jobList[0].name
      service.cancelJob(jobName)
      const midJobList = await service.listJobs()
      expect(midJobList[0].next).toBe(null)
      service.startJob(jobName)
      const endJobList = await service.listJobs()
      expect(endJobList[0].next).not.toBe(null)
    })

    test('should cancel all jobs', async () => {
      const jobList = await service.listJobs()
      expect(jobList.some(job => job.next === null)).toBe(false)
      service.cancelAllJobs()
      const endJobList = await service.listJobs()
      expect(endJobList.some(job => job.next !== null)).toBe(false)
    })

    test('should restart all jobs', async () => {
      await service.listJobs()
      service.cancelAllJobs()
      const jobList = await service.listJobs()
      expect(jobList.some(job => job.next !== null)).toBe(false)
      service.startAllJobs()
      const endJobList = await service.listJobs()
      expect(endJobList.some(job => job.next === null)).toBe(false)
    })
  })

  describe('scheduler', () => {
    let jobs
    let signInService
    let reminderService
    let dbLockingClient
    let configClient
    const jobSpec = '* * * * * *'

    beforeEach(() => {
      signInService = {
        getClientCredentialsTokens: jest.fn().mockReturnValue({ token: 'system-user-token' }),
      }

      reminderService = {
        notifyRoReminders: jest.fn().mockReturnValue({}),
      }

      dbLockingClient = {
        query: jest.fn().mockReturnValue({}),
      }

      configClient = {
        getJobSpec: jest.fn().mockReturnValue(jobSpec),
      }

      jobs = createNotificationJobs(reminderService, configClient, signInService)
    })

    test('should schedule jobs using the scheduler library', async () => {
      const scheduleStub = jest.fn().mockReturnValue({ reschedule: jest.fn().mockReturnValue() })

      const service = createJobSchedulerService(dbLockingClient, configClient, jobs, scheduleStub)
      await service.startAllJobs()

      expect(scheduleStub).toHaveBeenCalled()
      expect(scheduleStub).toHaveBeenCalledWith('roReminders', jobSpec, expect.anything())
    })
  })
})
