const moment = require('moment')
const templates = require('./config/notificationTemplates')
const notificationMailboxes = require('./config/notificationMailboxes')
const { notifyKey } = require('../config').notifications
const logger = require('../../log.js')
const { getIn, isEmpty } = require('../utils/functionalHelpers')
const { getRoCaseDueDate, getRoNewCaseDueDate } = require('../utils/dueDates')

module.exports = function createNotificationService(
  prisonerService,
  userAdminService,
  deadlineService,
  notifyClient,
  audit
) {
  async function getNotificationData({
    prisonerDetails,
    token,
    notificationType,
    submissionTarget,
    bookingId,
    transitionDate,
    sendingUser,
  }) {
    const common = {
      offender_name: [prisonerDetails.firstName, prisonerDetails.lastName].join(' '),
      offender_dob: prisonerDetails.dateOfBirth,
      booking_id: bookingId,
    }

    const notificationDataMethod = {
      CA_RETURN: getCaNotificationData,
      CA_DECISION: getCaNotificationData,
      RO_NEW: getRoNotificationData,
      RO_TWO_DAYS: getRoNotificationData,
      RO_DUE: getRoNotificationData,
      RO_OVERDUE: getRoNotificationData,
      DM_NEW: getDmNotificationData,
    }

    return notificationDataMethod[notificationType]
      ? notificationDataMethod[notificationType]({
          common,
          token,
          submissionTarget,
          bookingId,
          transitionDate,
          sendingUser,
        })
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

  async function getRoNotificationData({ common, token, submissionTarget, bookingId, transitionDate }) {
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

    const date = transitionDate ? getRoCaseDueDate(moment(transitionDate)) : getRoNewCaseDueDate()

    return [
      {
        personalisation: {
          ...common,
          ro_name: submissionTarget.com.name,
          prison: establishment.premise,
          date,
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

  async function notify({ user, notificationType, bookingId, notifications } = {}) {
    if (isEmpty(notifyKey) || notifyKey === 'NOTIFY_OFF') {
      logger.warn('No notification API key - notifications disabled')
      return
    }

    if (isEmpty(notifications)) {
      logger.warn('Empty notifications')
      return
    }

    if (isEmpty(templates[notificationType])) {
      logger.warn(`Unmapped notification template type: $type`)
      return
    }

    const { templateId } = templates[notificationType]

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
            logger.error('error notifying for type', notificationType)
            logger.error('error notifying for data', notification.personalisation)
          })
      }
    })
    auditEvent(user, bookingId, notificationType, notifications)
  }

  function auditEvent(user, bookingId, notificationType, notifications) {
    audit.record('NOTIFY', user, {
      bookingId,
      notificationType,
      notifications,
    })
  }

  async function notifyRoReminders(token) {
    await deadlineService.getOverdue('RO').then(licences => sendReminders(token, licences, 'RO_OVERDUE'))
    await deadlineService.getDueInDays('RO', 0).then(licences => sendReminders(token, licences, 'RO_DUE'))
    await deadlineService.getDueInDays('RO', 2).then(licences => sendReminders(token, licences, 'RO_TWO_DAYS'))
  }

  async function sendReminders(token, licences, notificationType) {
    // This is intentionally sequential to avoid timeouts sometimes arising from multiple quick calls to NOMIS API
    // Can't use for..of because eslint rules prohibit it
    await licences.reduce(async (previous, nextLicence) => {
      await previous
      return sendReminder(token, notificationType, nextLicence)
    }, Promise.resolve())
  }

  async function sendReminder(token, notificationType, { bookingId, transitionDate }) {
    const [submissionTarget, prisonerDetails] = await Promise.all([
      prisonerService.getOrganisationContactDetails('RO', bookingId, token),
      prisonerService.getPrisonerDetails(bookingId, token),
    ])

    if (isEmpty(prisonerDetails) || isEmpty(submissionTarget)) {
      logger.error(`Did not find notification data for booking id: ${bookingId}`)
      return
    }

    const notifications = await getNotificationData({
      prisonerDetails,
      token,
      notificationType,
      submissionTarget,
      bookingId,
      transitionDate,
    })

    notify({
      user: 'NOTIFICATION_SERVICE',
      notificationType,
      bookingId,
      notifications,
    })
  }

  return {
    getNotificationData,
    notify,
    notifyRoReminders,
  }
}
