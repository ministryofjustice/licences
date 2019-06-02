const logger = require('../../../log.js')

module.exports = function createNotificationJobs(notificationService, signInService) {
  async function roReminders() {
    logger.info('Running RO reminders')
    try {
      const systemToken = await signInService.getAnonymousClientCredentialsTokens()
      return await notificationService.notifyRoReminders(systemToken.token)
    } catch (error) {
      logger.error('Error running RO reminders', error.stack)
    }
  }

  return {
    roReminders,
  }
}
