const createNotificationJobs = require('../../../server/services/jobs/notificationJobs')

describe('notificationJobs', () => {
  let signInService
  let reminderService
  let jobs

  const notifyRoRemindersResult = { result: 'result' }

  beforeEach(() => {
    signInService = { getAnonymousClientCredentialsTokens: sinon.stub().resolves({ token: 'test-token' }) }
    reminderService = { notifyRoReminders: sinon.stub().resolves(notifyRoRemindersResult) }

    jobs = createNotificationJobs(reminderService, signInService)
  })

  it('should sign in and trigger notifications', async () => {
    const result = await jobs.roReminders()

    expect(signInService.getAnonymousClientCredentialsTokens).to.be.calledOnce()
    expect(reminderService.notifyRoReminders).to.be.calledOnce()
    expect(reminderService.notifyRoReminders).to.be.calledWith('test-token')
    expect(result).to.eql(notifyRoRemindersResult)
  })
})
