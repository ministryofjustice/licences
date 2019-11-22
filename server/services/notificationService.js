const moment = require('moment')
const R = require('ramda')
const templates = require('./config/notificationTemplates')
const logger = require('../../log.js')
const { getIn, isEmpty } = require('../utils/functionalHelpers')
const { getRoCaseDueDate, getRoNewCaseDueDate } = require('../utils/dueDates')

module.exports = function createNotificationService(
  prisonerService,
  roContactDetailsService,
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

    const roContactInfo = await roContactDetailsService.getContactDetails(deliusId)
    return R.prop('orgEmail', roContactInfo)
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

    const [establishment, roContactInfo] = await Promise.all([
      prisonerService.getEstablishmentForPrisoner(bookingId, token),
      roContactDetailsService.getContactDetails(deliusId),
    ])

    if (!roContactInfo) {
      logger.error(`No contact info for delius id: ${deliusId}`)
      return []
    }

    const prison = getIn(establishment, ['premise'])

    if (isEmpty(prison)) {
      logger.error(`Missing prison for bookingId: ${bookingId}`)
      return []
    }

    const date = transitionDate ? getRoCaseDueDate(moment(transitionDate)) : getRoNewCaseDueDate()
    const { email, orgEmail, organisation } = roContactInfo
    const base = { personalisation: { ...common, ro_name: submissionTarget.name, organisation, prison, date } }

    return [
      ...(isEmpty(email) ? [] : [{ ...base, email, templateName: 'STANDARD' }]),
      ...(isEmpty(orgEmail) ? [] : [{ ...base, email: orgEmail, templateName: 'COPY' }]),
    ]
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

  return {
    getNotificationData,
    sendNotifications,
    notify,
  }
}
