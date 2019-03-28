const proxyquire = require('proxyquire')
const createJobSchedulerService = require('../../server/services/jobSchedulerService')
const createNotificationJobs = require('../../server/services/jobs/notificationJobs')
const config = require('../../server/config')

describe('jobSchedulerService', () => {
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
  })

  afterEach(() => {
    service.cancelAllJobs()
  })

  it('should create RO reminders job', async () => {
    expect(service.listJobs().length).to.eql(1)
    expect(service.listJobs()[0].name).to.eql('roReminders')
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
    service.restartJob(jobName)
    expect(service.listJobs()[0].next).to.not.eql(null)
  })

  it('should cancel all jobs', async () => {
    expect(service.listJobs()[0].next).to.not.eql(null)
    service.cancelAllJobs()
    expect(service.listJobs()[0].next).to.eql(null)
  })

  it('should schedule jobs using the scheduler library', async () => {
    const scheduleStub = {
      scheduleJob: sinon.stub().returns({}),
    }

    const stubbedService = proxyquire('../../server/services/jobSchedulerService', {
      'node-schedule': scheduleStub,
    })

    await stubbedService(jobs)

    expect(scheduleStub.scheduleJob).to.be.calledOnce()
    expect(scheduleStub.scheduleJob).to.be.calledWith('roReminders', config.jobs.roReminders, sinon.match.func)
  })
})
