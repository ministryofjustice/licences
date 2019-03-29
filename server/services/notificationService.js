const templates = require('./config/notificationTemplates')
const {
  notifications: { notifyKey },
  domain,
} = require('../config')
const logger = require('../../log.js')
const { getIn, isEmpty } = require('../utils/functionalHelpers')
const { getRoNewCaseDueDate } = require('../utils/dueDates')

module.exports = function createNotificationService(
  prisonerService,
  userAdminService,
  configClient,
  notifyClient,
  audit
) {
  async function getNotificationData({
    prisoner,
    token,
    notificationType,
    submissionTarget,
    bookingId,
    sendingUserName,
  }) {
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
      ? notificationDataMethod[notificationType]({ common, token, submissionTarget, bookingId, sendingUserName })
      : []
  }

  async function getCaNotificationData({ common, submissionTarget, sendingUserName }) {
    const mailboxes = await configClient.getMailboxes(submissionTarget.agencyId, 'CA')

    if (isEmpty(mailboxes)) {
      logger.error(`Missing CA notification email addresses for agencyId: ${submissionTarget.agencyId}`)
      return []
    }
    const personalisation = { ...common, sender_name: sendingUserName }

    return mailboxes.map(mailbox => {
      return { personalisation, email: mailbox.email }
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

    const email = getIn(ro, ['orgEmail'])

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

    const mailboxes = await configClient.getMailboxes(establishment.agencyId, 'DM')

    if (isEmpty(mailboxes)) {
      logger.error(`Missing DM notification email addresses for agencyId: ${establishment.agencyId}`)
      return []
    }

    return mailboxes.map(mailbox => {
      return { personalisation: { ...common, dm_name: mailbox.name }, email: mailbox.email }
    })
  }

  async function sendNotifications({
    prisoner,
    notificationType,
    submissionTarget,
    bookingId,
    sendingUserName,
    token,
  }) {
    try {
      const notifications = await getNotificationData({
        prisoner,
        token,
        notificationType,
        submissionTarget,
        bookingId,
        sendingUserName,
      })

      await notify({
        sendingUserName,
        notificationType,
        bookingId,
        notifications,
      })

      return notifications
    } catch (error) {
      logger.warn(
        `Error sending notification for bookingId: ${bookingId}, transition: ${notificationType}`,
        error.stack
      )
      return []
    }
  }

  async function notify({ sendingUserName, type, bookingId, notifications } = {}) {
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
    auditEvent(sendingUserName, bookingId, type, notifications)
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
    sendNotifications,
    notify,
  }
}
