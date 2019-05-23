const proxyquire = require('proxyquire')
const moment = require('moment')
const createJobSchedulerService = require('../../server/services/jobSchedulerService')
const createNotificationJobs = require('../../server/services/jobs/notificationJobs')
const config = require('../../server/config')

describe('jobSchedulerService', () => {
  describe('createScheduledJobs', () => {
    let service
    let jobs
    let signInService
    let notificationService

    beforeEach(() => {
      signInService = {
        getClientCredentialsTokens: sinon.stub().resolves({ token: 'system-user-token' }),
      }

      notificationService = {
        notifyRoReminders: sinon.stub().resolves({}),
      }

      jobs = createNotificationJobs(notificationService, signInService)
      service = createJobSchedulerService(jobs)
      service.startAllJobs()
    })

    afterEach(() => {
      service.cancelAllJobs()
    })

    it('should list jobs', async () => {
      expect(service.listJobs().length).to.eql(1)
    })

    it('should create RO reminders job', async () => {
      const job = service.listJobs()[0]
      expect(job.name).to.eql('roReminders')
      expect(job.schedule).to.eql(config.jobs.roReminders)
      expect(moment(job.next, 'dddd Do MMMM HH:mm:ss').isValid()).to.eql(true)
      expect(job.outcome).to.eql('(pending)')
    })

    it('should cancel job and remove next execution', async () => {
      const jobName = service.listJobs()[0].name
      expect(service.listJobs()[0].next).to.not.eql(null)
      service.cancelJob(jobName)
      expect(service.listJobs()[0].next).to.eql(null)
    })

    it('should restart job and set next execution', async () => {
      const jobName = service.listJobs()[0].name
      service.cancelJob(jobName)
      expect(service.listJobs()[0].next).to.eql(null)
      service.startJob(jobName)
      expect(service.listJobs()[0].next).to.not.eql(null)
    })

    it('should cancel all jobs', async () => {
      expect(service.listJobs().some(job => job.next === null)).to.eql(false)
      service.cancelAllJobs()
      expect(service.listJobs().some(job => job.next !== null)).to.eql(false)
    })

    it('should restart all jobs', async () => {
      service.cancelAllJobs()
      expect(service.listJobs().some(job => job.next !== null)).to.eql(false)
      service.startAllJobs()
      expect(service.listJobs().some(job => job.next === null)).to.eql(false)
    })
  })

  describe('scheduler', () => {
    let jobs
    let signInService
    let notificationService

    beforeEach(() => {
      signInService = {
        getClientCredentialsTokens: sinon.stub().resolves({ token: 'system-user-token' }),
      }

      notificationService = {
        notifyRoReminders: sinon.stub().resolves({}),
      }

      jobs = createNotificationJobs(notificationService, signInService)
    })

    it('should schedule jobs using the scheduler library', async () => {
      const scheduleStub = {
        scheduleJob: sinon.stub().returns({ reschedule: sinon.stub().returns() }),
      }

      const stubbedService = proxyquire('../../server/services/jobSchedulerService', {
        'node-schedule': scheduleStub,
      })

      const service = stubbedService(jobs)
      await service.startAllJobs()

      expect(scheduleStub.scheduleJob).to.be.calledOnce()
      expect(scheduleStub.scheduleJob).to.be.calledWith('roReminders', config.jobs.roReminders, sinon.match.func)
    })
  })
})
