const logger = require('../../../log')

module.exports = function createNotificationJobs(reminderService, signInService) {
  async function roReminders() {
    logger.info('Running RO reminders')
    try {
      const systemToken = await signInService.getAnonymousClientCredentialsTokens()
      return await reminderService.notifyRoReminders(systemToken)
    } catch (error) {
      logger.error('Error running RO reminders', error.stack)
      return null
    }
  }

  return {
    roReminders,
  }
}
