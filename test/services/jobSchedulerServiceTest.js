const proxyquire = require('proxyquire')
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
        getClientCredentialsTokens: sinon.stub().resolves({ token: 'system-user-token' }),
      }

      reminderService = {
        notifyRoReminders: sinon.stub().resolves({}),
      }

      dbLockingClient = {
        query: sinon.stub().resolves({}),
      }

      configClient = {
        getJobSpec: sinon.stub().resolves(jobSpec),
      }

      jobs = createNotificationJobs(reminderService, signInService)
      service = createJobSchedulerService(dbLockingClient, configClient, jobs)
      service.startAllJobs()
    })

    afterEach(() => {
      service.cancelAllJobs()
    })

    it('should list jobs', async () => {
      const jobList = await service.listJobs()
      expect(jobList.length).to.eql(1)
    })

    it('should create RO reminders job', async () => {
      const jobList = await service.listJobs()
      const job = jobList[0]
      expect(job.name).to.eql('roReminders')
      expect(job.schedule).to.eql(jobSpec)
      expect(moment(job.next, 'dddd Do MMMM HH:mm:ss').isValid()).to.eql(true)
      expect(job.outcome).to.eql(undefined)
    })

    it('should cancel job and remove next execution', async () => {
      const jobList = await service.listJobs()
      const jobName = jobList[0].name
      expect(jobList[0].next).to.not.eql(null)
      service.cancelJob(jobName)

      const endJobsList = await service.listJobs()
      expect(endJobsList[0].next).to.eql(null)
    })

    it('should restart job and set next execution', async () => {
      const jobList = await service.listJobs()
      const jobName = jobList[0].name
      service.cancelJob(jobName)
      const midJobList = await service.listJobs()
      expect(midJobList[0].next).to.eql(null)
      service.startJob(jobName)
      const endJobList = await service.listJobs()
      expect(endJobList[0].next).to.not.eql(null)
    })

    it('should cancel all jobs', async () => {
      const jobList = await service.listJobs()
      expect(jobList.some(job => job.next === null)).to.eql(false)
      service.cancelAllJobs()
      const endJobList = await service.listJobs()
      expect(endJobList.some(job => job.next !== null)).to.eql(false)
    })

    it('should restart all jobs', async () => {
      await service.listJobs()
      service.cancelAllJobs()
      const jobList = await service.listJobs()
      expect(jobList.some(job => job.next !== null)).to.eql(false)
      service.startAllJobs()
      const endJobList = await service.listJobs()
      expect(endJobList.some(job => job.next === null)).to.eql(false)
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
        getClientCredentialsTokens: sinon.stub().resolves({ token: 'system-user-token' }),
      }

      reminderService = {
        notifyRoReminders: sinon.stub().resolves({}),
      }

      dbLockingClient = {
        query: sinon.stub().resolves({}),
      }

      configClient = {
        getJobSpec: sinon.stub().resolves(jobSpec),
      }

      jobs = createNotificationJobs(reminderService, configClient, signInService)
    })

    it('should schedule jobs using the scheduler library', async () => {
      const scheduleStub = {
        scheduleJob: sinon.stub().returns({ reschedule: sinon.stub().returns() }),
      }

      const stubbedService = proxyquire('../../server/services/jobSchedulerService', {
        'node-schedule': scheduleStub,
      })

      const service = stubbedService(dbLockingClient, configClient, jobs)
      await service.startAllJobs()

      expect(scheduleStub.scheduleJob).to.be.calledOnce()
      expect(scheduleStub.scheduleJob).to.be.calledWith('roReminders', jobSpec, sinon.match.func)
    })
  })
})
