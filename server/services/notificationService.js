const moment = require('moment')
const { append, compose, converge, head, identity, mergeDeepLeft, unless } = require('ramda')
const templates = require('./config/notificationTemplates')
const {
  notifications: { notifyKey, activeNotificationTypes, clearingOfficeEmail },
  domain,
} = require('../config')
const logger = require('../../log.js')
const { getIn, isEmpty } = require('../utils/functionalHelpers')
const { getRoCaseDueDate, getRoNewCaseDueDate } = require('../utils/dueDates')

module.exports = function createNotificationService(
  prisonerService,
  userAdminService,
  deadlineService,
  configClient,
  notifyClient,
  audit,
  nomisClientBuilder
) {
  async function getNotificationData({
    prisoner,
    token,
    notificationType,
    submissionTarget,
    bookingId,
    transitionDate,
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
      CA_RETURN: getCaAndClearingOfficeNotificationData,
      DM_TO_CA_RETURN: getCaNotificationData,
      CA_DECISION: getCaNotificationData,
      RO_NEW: getRoAndClearingOfficeNotificationData,
      RO_TWO_DAYS: getRoNotificationData,
      RO_DUE: getRoNotificationData,
      RO_OVERDUE: getRoAndClearingOfficeNotificationData,
      DM_NEW: getDmNotificationData,
    }

    return notificationDataMethod[notificationType]
      ? notificationDataMethod[notificationType]({
          common,
          token,
          submissionTarget,
          bookingId,
          transitionDate,
          sendingUserName,
        })
      : []
  }

  // notification -> notification
  const clearingOfficeNotificationFromPrototype = mergeDeepLeft({ email: clearingOfficeEmail })

  // [notification] -> [notification]
  const appendClearingOfficeNotification = converge(append, [
    compose(
      clearingOfficeNotificationFromPrototype,
      head
    ),
    identity,
  ])

  // [notification] -> [notification]
  const appendClearingOfficeNotificationIfNotEmpty = unless(isEmpty, appendClearingOfficeNotification)

  // (a -> b) -> Promise -> Promise
  const andThen = fn => promise => promise.then(fn)

  const getCaAndClearingOfficeNotificationData = compose(
    andThen(appendClearingOfficeNotificationIfNotEmpty),
    getCaNotificationData
  )

  const getRoAndClearingOfficeNotificationData = compose(
    andThen(appendClearingOfficeNotificationIfNotEmpty),
    getRoNotificationData
  )

  async function getCaNotificationData({ common, token, submissionTarget, sendingUserName }) {
    const agencyId = getIn(submissionTarget, ['agencyId'])

    if (isEmpty(agencyId)) {
      logger.error('Missing agencyId for CA notification')
      return []
    }

    const establishment = await nomisClientBuilder(token).getEstablishment(agencyId)
    const prison = establishment.premise

    const mailboxes = await configClient.getMailboxes(submissionTarget.agencyId, 'CA')

    if (isEmpty(mailboxes)) {
      logger.error(`Missing CA notification email addresses for agencyId: ${agencyId}`)
      return []
    }
    const personalisation = { ...common, sender_name: sendingUserName, prison }

    return mailboxes.map(mailbox => {
      return {
        personalisation: mergeDeepLeft({ ca_name: mailbox.name }, personalisation),
        email: mailbox.email,
      }
    })
  }

  async function getRoNotificationData({ common, token, submissionTarget, bookingId, transitionDate }) {
    const deliusId = getIn(submissionTarget, ['deliusId'])
    if (isEmpty(deliusId)) {
      logger.error('Missing COM deliusId')
      return []
    }

    const [establishment, ro] = await Promise.all([
      prisonerService.getEstablishmentForPrisoner(bookingId, token),
      userAdminService.getRoUserByDeliusId(deliusId),
    ])

    const email = getIn(ro, ['orgEmail'])
    const organisation = getIn(ro, ['organisation'])
    const prison = getIn(establishment, ['premise'])

    if (isEmpty(email)) {
      logger.error(`Missing orgEmail for RO: ${deliusId}`)
      return []
    }

    if (isEmpty(prison)) {
      logger.error(`Missing prison for bookingId: ${bookingId}`)
      return []
    }

    const date = transitionDate ? getRoCaseDueDate(moment(transitionDate)) : getRoNewCaseDueDate()

    return [
      {
        personalisation: {
          ...common,
          ro_name: submissionTarget.name,
          organisation,
          prison,
          date,
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
    token,
    notificationType,
    submissionTarget,
    bookingId,
    transitionDate,
    sendingUserName,
  }) {
    if (!activeNotificationTypes.includes(notificationType)) {
      return
    }

    try {
      const notifications = await getNotificationData({
        prisoner,
        token,
        notificationType,
        submissionTarget,
        bookingId,
        transitionDate,
        sendingUserName,
      })

      if (isEmpty(notifications)) {
        return []
      }

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

  async function notify({ sendingUserName, notificationType, bookingId, notifications } = {}) {
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

  async function notifyRoReminders(token) {
    const overdue = await notifyCases(token, () => deadlineService.getOverdue('RO'), 'RO_OVERDUE')
    const due = await notifyCases(token, () => deadlineService.getDueInDays('RO', 0), 'RO_DUE')
    const soon = await notifyCases(token, () => deadlineService.getDueInDays('RO', 2), 'RO_TWO_DAYS')

    return { overdue, due, soon }
  }

  async function notifyCases(token, caseFinderMethod, notificationType) {
    try {
      const cases = await caseFinderMethod()
      if (!isEmpty(cases)) {
        await sendReminders(token, cases, notificationType)
      }
      return cases ? cases.length : 0
    } catch (error) {
      logger.error(`Error notifying cases for notification type: ${notificationType}`, error.stack)
    }
  }

  async function sendReminders(token, licences, notificationType) {
    // This is intentionally sequential to avoid timeouts sometimes arising from multiple quick calls to NOMIS API
    await licences.reduce(async (previous, nextLicence) => {
      await previous
      return sendReminder(token, notificationType, nextLicence.booking_id, nextLicence.transition_date)
    }, Promise.resolve())
  }

  async function sendReminder(token, notificationType, bookingId, transitionDate) {
    const [submissionTarget, prisoner] = await getPrisonerData(bookingId, token)

    if (isEmpty(submissionTarget) || isEmpty(prisoner)) {
      return
    }

    sendNotifications({
      prisoner,
      notificationType,
      submissionTarget,
      bookingId,
      sendingUserName: 'NOTIFICATION_SERVICE',
      token,
      transitionDate,
    })
  }

  async function getPrisonerData(bookingId, token) {
    return Promise.all([
      prisonerService.getOrganisationContactDetails('RO', bookingId, token),
      prisonerService.getPrisonerPersonalDetails(bookingId, token),
    ]).catch(error => {
      logger.error('Error getting prisoner details for notification', error.stack)
      return []
    })
  }

  return {
    getNotificationData,
    sendNotifications,
    notify,
    notifyRoReminders,
  }
}
