const templates = require('./config/notificationTemplates')
const notificationMailboxes = require('./config/notificationMailboxes')
const {
  notifications: { notifyKey },
  domain,
} = require('../config')
const logger = require('../../log.js')
const { getIn, isEmpty } = require('../utils/functionalHelpers')
const { getRoNewCaseDueDate } = require('../utils/dueDates')

module.exports = function createNotificationService(prisonerService, userAdminService, notifyClient, audit) {
  async function getNotificationData({ prisoner, token, notificationType, submissionTarget, bookingId, sendingUser }) {
    const common = {
      offender_name: [prisoner.firstName, prisoner.lastName].join(' '),
      offender_dob: prisoner.dateOfBirth,
      offender_noms: prisoner.offenderNo,
      booking_id: bookingId,
      domain,
    }

    const notificationDataMethod = {
      CA_RETURN: getCaNotificationData,
      CA_DECISION: getCaNotificationData,
      RO_NEW: getRoNotificationData,
      DM_NEW: getDmNotificationData,
    }

    return notificationDataMethod[notificationType]
      ? notificationDataMethod[notificationType]({ common, token, submissionTarget, bookingId, sendingUser })
      : []
  }

  function getCaNotificationData({ common, submissionTarget, sendingUser }) {
    const emails = getIn(notificationMailboxes, [submissionTarget.agencyId, 'ca'])
    if (isEmpty(emails)) {
      logger.error(`Missing CA notification email addresses for agencyId: ${submissionTarget.agencyId}`)
      return []
    }
    const personalisation = { ...common, sender_name: sendingUser.username }

    return emails.map(email => {
      return { personalisation, email }
    })
  }

  async function getRoNotificationData({ common, token, submissionTarget, bookingId }) {
    const deliusId = getIn(submissionTarget, ['com', 'deliusId'])
    if (isEmpty(deliusId)) {
      logger.error('Missing COM deliusId')
      return []
    }

    const [establishment, ro] = await Promise.all([
      prisonerService.getEstablishmentForPrisoner(bookingId, token),
      userAdminService.getRoUserByDeliusId(deliusId),
    ])
    const email = ro.orgEmail

    if (isEmpty(email)) {
      logger.error(`Missing orgEmail for RO: ${deliusId}`)
      return []
    }

    return [
      {
        personalisation: {
          ...common,
          ro_name: submissionTarget.com.name,
          prison: establishment.premise,
          date: getRoNewCaseDueDate(),
        },
        email,
      },
    ]
  }

  async function getDmNotificationData({ common, token, bookingId }) {
    const establishment = await prisonerService.getEstablishmentForPrisoner(bookingId, token)
    const contacts = getIn(notificationMailboxes, [establishment.agencyId, 'dm'])
    if (isEmpty(contacts)) {
      logger.error(`Missing DM notification email addresses for agencyId: ${establishment.agencyId}`)
      return []
    }

    const notifications = contacts.map(contact => {
      return { personalisation: { ...common, dm_name: contact.name }, email: contact.email }
    })

    return notifications
  }

  async function notify({ user, type, bookingId, notifications } = {}) {
    if (isEmpty(notifyKey) || notifyKey === 'NOTIFY_OFF') {
      logger.warn('No notification API key - notifications disabled')
      return
    }

    if (isEmpty(notifications)) {
      logger.warn('Empty notifications')
      return
    }

    if (isEmpty(templates[type])) {
      logger.warn(`Unmapped notification template type: $type`)
      return
    }

    const { templateId } = templates[type]

    notifications.forEach(notification => {
      if (isEmpty(notification.email)) {
        logger.warn('Empty notification email')
      } else {
        notifyClient
          .sendEmail(templateId, notification.email, { personalisation: notification.personalisation })
          .then(() => {
            logger.info(`Successful notify for email: ${notification.email}`)
          })
          .catch(error => {
            logger.error('Error sending notification email ', notification.email)
            logger.error(error.stack)
            logger.error('error notifying for type', type)
            logger.error('error notifying for data', notification.personalisation)
          })
      }
    })
    auditEvent(user, bookingId, type, notifications)
  }

  function auditEvent(user, bookingId, notificationType, notifications) {
    audit.record('NOTIFY', user, {
      bookingId,
      notificationType,
      notifications,
    })
  }

  return {
    getNotificationData,
    notify,
  }
}
