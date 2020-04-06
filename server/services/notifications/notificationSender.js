const templates = require('../config/notificationTemplates')
const logger = require('../../../log.js')
const { isEmpty } = require('../../utils/functionalHelpers')

module.exports = function createNotificationSender(notifyClient, audit, notifyKey) {
  async function notify({ sendingUserName, notificationType, bookingId, notifications }) {
    if (isEmpty(notifyKey) || notifyKey === 'NOTIFY_OFF') {
      logger.warn('No notification API key - notifications disabled')
      return
    }

    if (isEmpty(notifications)) {
      logger.warn('Empty notifications')
      return
    }

    notifications.forEach((notification) => {
      if (isEmpty(templates[notification.templateName])) {
        logger.warn(`Unmapped notification template name: ${notification.templateName}`)
        return
      }

      const { templateId } = templates[notification.templateName]

      if (isEmpty(notification.email)) {
        logger.warn('Empty notification email')
      } else {
        notifyClient
          .sendEmail(templateId, notification.email, { personalisation: notification.personalisation })
          .then(() => {
            logger.info(`Successful notify for email: ${notification.email}`)
          })
          .catch((error) => {
            logger.error('Error sending notification email ', notification.email)
            logger.error(error.stack)
          })
      }
    })
    auditEvent(sendingUserName, bookingId, notificationType, notifications)
  }

  function auditEvent(user, bookingId, notificationType, notifications) {
    audit.record('NOTIFY', user, {
      bookingId,
      notificationType,
      notifications,
    })
  }

  return {
    notify,
  }
}
