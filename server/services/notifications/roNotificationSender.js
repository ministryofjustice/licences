/**
 * @typedef {import("../../../types/licences").RoNotificationSender} RoNotificationSender
 */
const moment = require('moment')
const logger = require('../../../log.js')
const { isEmpty } = require('../../utils/functionalHelpers')
const { getRoCaseDueDate, getRoNewCaseDueDate } = require('../../utils/dueDates')

/**
 * @return {RoNotificationSender}
 */
module.exports = function createNotificationService(
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

  function variables(bookingId, roName, organisation, prison, transitionDate) {
    const date = transitionDate ? getRoCaseDueDate(moment(transitionDate)) : getRoNewCaseDueDate()
    return {
      booking_id: bookingId,
      domain,
      ro_name: roName,
      organisation,
      prison,
      date,
    }
  }

  return {
    notificationTypes,

    getNotifications(responsibleOfficer, personalisation, { sendToClearingOffice, templateNames }) {
      const { email, functionalMailbox } = responsibleOfficer

      const sendToRo = !isEmpty(email)
      const sendToRoOrg = !isEmpty(functionalMailbox)
      const sendToClearing = sendToClearingOffice && !clearingOfficeEmailDisabled && (sendToRo || sendToRoOrg)

      return [
        ...(sendToRo ? [{ personalisation, email, templateName: templateNames.STANDARD }] : []),
        ...(sendToRoOrg ? [{ personalisation, email: functionalMailbox, templateName: templateNames.COPY }] : []),
        ...(sendToClearing ? [{ personalisation, email: clearingOfficeEmail, templateName: templateNames.COPY }] : []),
      ]
    },

    async sendNotifications({
      responsibleOfficer,
      notificationType,
      bookingId,
      prison,
      transitionDate,
      sendingUserName,
    }) {
      if (!activeNotificationTypes.includes(notificationType)) {
        return []
      }

      const notificationConfig = notificationTypes[notificationType]

      const personalisation = variables(
        bookingId,
        responsibleOfficer.name,
        responsibleOfficer.organisation,
        prison,
        transitionDate
      )

      try {
        const notifications = this.getNotifications(responsibleOfficer, personalisation, notificationConfig)
        await notificationSender.notify({ sendingUserName, notificationType, bookingId, notifications })

        return notifications
      } catch (error) {
        logger.error(
          `Error sending notification for bookingId: ${bookingId}, transition: ${notificationType}`,
          error.stack
        )
        return []
      }
    },
  }
}
