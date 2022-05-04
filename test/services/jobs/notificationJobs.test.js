const createNotificationJobs = require('../../../server/services/jobs/notificationJobs')

describe('notificationJobs', () => {
  let signInService
  let reminderService
  let jobs

  const notifyRoRemindersResult = { result: 'result' }

  beforeEach(() => {
    signInService = { getAnonymousClientCredentialsTokens: jest.fn().mockReturnValue('test-token') }
    reminderService = { notifyRoReminders: jest.fn().mockReturnValue(notifyRoRemindersResult) }

    jobs = createNotificationJobs(reminderService, signInService)
  })

  test('should sign in and trigger notifications', async () => {
    const result = await jobs.roReminders()

    expect(signInService.getAnonymousClientCredentialsTokens).toHaveBeenCalled()
    expect(reminderService.notifyRoReminders).toHaveBeenCalled()
    expect(reminderService.notifyRoReminders).toHaveBeenCalledWith('test-token')
    expect(result).toEqual(notifyRoRemindersResult)
  })
})
