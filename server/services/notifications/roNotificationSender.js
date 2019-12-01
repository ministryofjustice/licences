const moment = require('moment')
const logger = require('../../../log.js')
const { getIn, isEmpty } = require('../../utils/functionalHelpers')
const { getRoCaseDueDate, getRoNewCaseDueDate } = require('../../utils/dueDates')

module.exports = function createNotificationService(
  prisonerService,
  roContactDetailsService,
  notificationSender,
  { notifications: { activeNotificationTypes, clearingOfficeEmail, clearingOfficeEmailEnabled }, domain }
) {
  const clearingOfficeEmailDisabled = clearingOfficeEmailEnabled.toUpperCase().trim() !== 'YES'

  const notificationTypes = {
    RO_NEW: { sendToClearingOffice: true, templateNames: { STANDARD: 'RO_NEW', COPY: 'RO_NEW_COPY' } },
    RO_TWO_DAYS: { sendToClearingOffice: false, templateNames: { STANDARD: 'RO_TWO_DAYS', COPY: 'RO_TWO_DAYS_COPY' } },
    RO_DUE: { sendToClearingOffice: false, templateNames: { STANDARD: 'RO_DUE', COPY: 'RO_DUE_COPY' } },
    RO_OVERDUE: { sendToClearingOffice: true, templateNames: { STANDARD: 'RO_OVERDUE', COPY: 'RO_OVERDUE_COPY' } },
  }

  function variables(prisoner, bookingId, submissionTarget, organisation, prison, transitionDate) {
    const date = transitionDate ? getRoCaseDueDate(moment(transitionDate)) : getRoNewCaseDueDate()
    return {
      offender_name: [prisoner.firstName, prisoner.lastName].join(' '),
      offender_dob: prisoner.dateOfBirth,
      offender_noms: prisoner.offenderNo,
      booking_id: bookingId,
      domain,
      ro_name: submissionTarget.name,
      organisation,
      prison,
      date,
    }
  }

  async function getNotifications({
    prisoner,
    token,
    submissionTarget,
    bookingId,
    transitionDate,
    notificationConfig: { sendToClearingOffice, templateNames },
  }) {
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

    const { email, orgEmail, organisation } = roContactInfo
    const personalisation = variables(prisoner, bookingId, submissionTarget, organisation, prison, transitionDate)

    const sendToRo = !isEmpty(email)
    const sendToRoOrg = !isEmpty(orgEmail)
    const sendToClearing = sendToClearingOffice && !clearingOfficeEmailDisabled && (sendToRo || sendToRoOrg)

    return [
      ...(sendToRo ? [{ personalisation, email, templateName: templateNames.STANDARD }] : []),
      ...(sendToRoOrg ? [{ personalisation, email: orgEmail, templateName: templateNames.COPY }] : []),
      ...(sendToClearing ? [{ personalisation, email: clearingOfficeEmail, templateName: templateNames.COPY }] : []),
    ]
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

    const notificationConfig = notificationTypes[notificationType]

    try {
      const notifications = getNotifications({
        prisoner,
        token,
        submissionTarget,
        bookingId,
        transitionDate,
        notificationConfig,
      })

      await notificationSender.notify({ sendingUserName, notificationType, bookingId, notifications })

      return notifications
    } catch (error) {
      logger.warn(
        `Error sending notification for bookingId: ${bookingId}, transition: ${notificationType}`,
        error.stack
      )
      return []
    }
  }

  return {
    notificationTypes,
    getNotifications,
    sendNotifications,
  }
}
