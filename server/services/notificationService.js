const templates = require('./config/notificationTemplates')
const { notifyKey } = require('../config').notifications
const logger = require('../../log.js')
const { isEmpty } = require('../utils/functionalHelpers')

module.exports = function createNotificationService(notifyClient, audit) {
  async function notify(username, type, notificationData) {
    if (notifyKey === 'NOTIFY_OFF') {
      logger.warn('No notification API key - notifications disabled')
      return
    }

    if (isEmpty(notificationData) || isEmpty(notificationData.emails)) {
      logger.warn('No email addresses for notification', notificationData)
      return
    }

    if (isEmpty(templates[type])) {
      logger.error(`Unmapped notification template type: $type`)
      return
    }

    const { templateId } = templates[type]

    notificationData.emails.forEach(async email => {
      try {
        await notifyClient.sendEmail(templateId, email, { personalisation: notificationData })
      } catch (error) {
        logger.error('Error sending notification email ', email)
        logger.error(error.stack)
        logger.error('error notifying for type', type)
        logger.error('error notifying for data', notificationData)
      }
    })

    auditEvent(username, notificationData.booking_id, type, notificationData)
  }

  function auditEvent(user, bookingId, notificationType, notificationData) {
    audit.record('NOTIFY', user, {
      bookingId,
      notificationType,
      notificationData,
    })
  }

  return {
    notify,
  }
}
