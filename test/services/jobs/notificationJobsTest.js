const createNotificationJobs = require('../../../server/services/jobs/notificationJobs')

describe('notificationJobs', () => {
  let signInService
  let notificationService
  let jobs

  beforeEach(() => {
    signInService = { getClientCredentialsTokens: sinon.stub().resolves({ token: 'test-token' }) }
    notificationService = { notifyRoReminders: sinon.stub().resolves() }

    jobs = createNotificationJobs(notificationService, signInService)
  })

  it('should sign in and trigger notifications', async () => {
    await jobs.roReminders()

    expect(signInService.getClientCredentialsTokens).to.be.calledOnce()
    expect(notificationService.notifyRoReminders).to.be.calledOnce()
    expect(notificationService.notifyRoReminders).to.be.calledWith('test-token')
  })
})
