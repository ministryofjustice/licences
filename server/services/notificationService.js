const moment = require('moment')
const R = require('ramda')
const templates = require('./config/notificationTemplates')
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
  nomisClientBuilder,
  { notifications: { notifyKey, activeNotificationTypes, clearingOfficeEmail, clearingOfficeEmailEnabled }, domain }
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

  const logIfMissing = (val, message) => {
    if (isEmpty(val)) {
      logger.error(message)
    }
  }

  // object -> string -> string
  const replaceName = replacements => name => R.propOr(name, name, replacements)

  // object -> [notification] -> [notification]
  const replaceTemplateNames = replacements => R.map(R.over(R.lensProp('templateName'), replaceName(replacements)))

  const clearingOfficeEmailDisabled = clearingOfficeEmailEnabled.toUpperCase().trim() !== 'YES'

  const getRoOrgEmail = async ({ bookingId, token }) => {
    const roOfficer = await prisonerService.getResponsibleOfficer(bookingId, token)
    const deliusId = getIn(roOfficer, ['deliusId'])

    if (isEmpty(deliusId)) {
      logger.error(`Missing COM deliusId for booking id: '${bookingId}'`, roOfficer)
      return null
    }

    const ro = await userAdminService.getRoUserByDeliusId(deliusId)
    return R.prop('orgEmail', ro)
  }

  const roOrganisationNotification = async (args, notifications) => {
    const orgEmail = await getRoOrgEmail(args)
    return isEmpty(orgEmail) || isEmpty(notifications)
      ? []
      : [{ ...notifications[0], email: orgEmail, templateName: 'COPY' }]
  }

  const clearingOfficeNotification = notifications =>
    clearingOfficeEmailDisabled || isEmpty(notifications)
      ? []
      : [{ ...notifications[0], email: clearingOfficeEmail, templateName: 'COPY' }]

  const getCaAndClearingOfficeAndRoOrganisationNotifications = async args => {
    const notifications = await getCaNotifications(args)
    return [
      ...notifications,
      ...clearingOfficeNotification(notifications),
      ...(await roOrganisationNotification(args, notifications)),
    ]
  }

  const getRoAndClearingOfficeNotifications = async args => {
    const notifications = await getRoNotifications(args)
    return [...notifications, ...clearingOfficeNotification(notifications)]
  }

  async function getCaNotifications({ common, token, submissionTarget, sendingUserName }) {
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
        personalisation: { ...personalisation, ca_name: mailbox.name },
        email: mailbox.email,
        templateName: 'STANDARD',
      }
    })
  }

  async function getRoNotifications({ common, token, submissionTarget, bookingId, transitionDate }) {
    const deliusId = getIn(submissionTarget, ['deliusId'])
    if (isEmpty(deliusId)) {
      logger.error('Missing COM deliusId')
      return []
    }

    const [establishment, ro] = await Promise.all([
      prisonerService.getEstablishmentForPrisoner(bookingId, token),
      userAdminService.getRoUserByDeliusId(deliusId),
    ])

    const organisation = getIn(ro, ['organisation'])
    const prison = getIn(establishment, ['premise'])

    if (isEmpty(prison)) {
      logger.error(`Missing prison for bookingId: ${bookingId}`)
      return []
    }

    const date = transitionDate ? getRoCaseDueDate(moment(transitionDate)) : getRoNewCaseDueDate()

    return makeRoNotifications(
      R.prop('email', ro),
      R.prop('orgEmail', ro),
      { personalisation: { ...common, ro_name: submissionTarget.name, organisation, prison, date } },
      deliusId
    )
  }

  const makeRoNotifications = (email, orgEmail, base, deliusId) => {
    logIfMissing(orgEmail, `Missing orgEmail for RO: ${deliusId}`)
    logIfMissing(email, `Missing email for RO: ${deliusId}`)

    const orgNotification = isEmpty(orgEmail) ? [] : [{ ...base, email: orgEmail, templateName: 'COPY' }]
    const roNotification = isEmpty(email) ? [] : [{ ...base, email, templateName: 'STANDARD' }]

    return [...roNotification, ...orgNotification]
  }

  async function getDmNotifications({ common, token, bookingId }) {
    const establishment = await prisonerService.getEstablishmentForPrisoner(bookingId, token)

    const mailboxes = await configClient.getMailboxes(establishment.agencyId, 'DM')

    if (isEmpty(mailboxes)) {
      logger.error(`Missing DM notification email addresses for agencyId: ${establishment.agencyId}`)
      return []
    }

    return mailboxes.map(mailbox => {
      return { personalisation: { ...common, dm_name: mailbox.name }, email: mailbox.email, templateName: 'STANDARD' }
    })
  }

  const notificationDataMethod = {
    CA_RETURN: R.compose(
      R.then(replaceTemplateNames({ STANDARD: 'CA_RETURN', COPY: 'CA_RETURN_COPY' })),
      getCaAndClearingOfficeAndRoOrganisationNotifications
    ),
    DM_TO_CA_RETURN: R.compose(
      R.then(replaceTemplateNames({ STANDARD: 'CA_RETURN' })),
      getCaNotifications
    ),
    CA_DECISION: R.compose(
      R.then(replaceTemplateNames({ STANDARD: 'CA_DECISION' })),
      getCaNotifications
    ),
    RO_NEW: R.compose(
      R.then(replaceTemplateNames({ STANDARD: 'RO_NEW', COPY: 'RO_NEW_COPY' })),
      getRoAndClearingOfficeNotifications
    ),
    RO_TWO_DAYS: R.compose(
      R.then(replaceTemplateNames({ STANDARD: 'RO_TWO_DAYS', COPY: 'RO_TWO_DAYS_COPY' })),
      getRoNotifications
    ),
    RO_DUE: R.compose(
      R.then(replaceTemplateNames({ STANDARD: 'RO_DUE', COPY: 'RO_DUE_COPY' })),
      getRoNotifications
    ),
    RO_OVERDUE: R.compose(
      R.then(replaceTemplateNames({ STANDARD: 'RO_OVERDUE', COPY: 'RO_OVERDUE_COPY' })),
      getRoAndClearingOfficeNotifications
    ),
    DM_NEW: R.compose(
      R.then(replaceTemplateNames({ STANDARD: 'DM_NEW' })),
      getDmNotifications
    ),
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

    notifications.forEach(notification => {
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
