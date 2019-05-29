const createNotificationJobs = require('../../../server/services/jobs/notificationJobs')

describe('notificationJobs', () => {
  let signInService
  let notificationService
  let jobs

  const notifyRoRemindersResult = { result: 'result' }

  beforeEach(() => {
    signInService = { getAnonymousClientCredentialsTokens: sinon.stub().resolves({ token: 'test-token' }) }
    notificationService = { notifyRoReminders: sinon.stub().resolves(notifyRoRemindersResult) }

    jobs = createNotificationJobs(notificationService, signInService)
  })

  it('should sign in and trigger notifications', async () => {
    const result = await jobs.roReminders()

    expect(signInService.getAnonymousClientCredentialsTokens).to.be.calledOnce()
    expect(notificationService.notifyRoReminders).to.be.calledOnce()
    expect(notificationService.notifyRoReminders).to.be.calledWith('test-token')
    expect(result).to.eql(notifyRoRemindersResult)
  })
})
