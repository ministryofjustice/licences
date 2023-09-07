/**
 * @typedef {import("../../../types/licences").RoNotificationSender} RoNotificationSender
 */
const moment = require('moment')
const logger = require('../../../log')
const { isEmpty } = require('../../utils/functionalHelpers')
const { getRoCaseDueDate, getRoNewCaseDueDate } = require('../../utils/dueDates')

/**
 * @return {RoNotificationSender}
 */
module.exports = function createRoNotificationSender(
  notificationSender,
  { notifications: { activeNotificationTypes, ...rest }, domain }
) {
  const notificationTypes = {
    RO_NEW: { templateNames: { STANDARD: 'RO_NEW', COPY: 'RO_NEW_COPY' } },
    RO_TWO_DAYS: { templateNames: { STANDARD: 'RO_TWO_DAYS', COPY: 'RO_TWO_DAYS_COPY' } },
    RO_DUE: { templateNames: { STANDARD: 'RO_DUE', COPY: 'RO_DUE_COPY' } },
    RO_OVERDUE: { templateNames: { STANDARD: 'RO_OVERDUE', COPY: 'RO_OVERDUE_COPY' } },
  }

  function variables(bookingId, offenderNo, roName, organisation, prison, transitionDate) {
    const date = transitionDate ? getRoCaseDueDate(moment(transitionDate)) : getRoNewCaseDueDate()
    return {
      booking_id: bookingId,
      offenderNo,
      domain,
      ro_name: roName,
      organisation,
      prison,
      date,
    }
  }

  return {
    notificationTypes,

    getNotifications(responsibleOfficer, personalisation, { templateNames }) {
      const { email, functionalMailbox } = responsibleOfficer

      const sendToRo = !isEmpty(email)
      const sendToRoOrg = !isEmpty(functionalMailbox)

      return [
        ...(sendToRo ? [{ personalisation, email, templateName: templateNames.STANDARD }] : []),
        ...(sendToRoOrg ? [{ personalisation, email: functionalMailbox, templateName: templateNames.COPY }] : []),
      ]
    },

    async sendNotifications({
      responsibleOfficer,
      notificationType,
      bookingId,
      offenderNo,
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
        offenderNo,
        responsibleOfficer.name,
        responsibleOfficer.organisation,
        prison,
        transitionDate
      )

      try {
        const notifications = this.getNotifications(responsibleOfficer, personalisation, notificationConfig)
        logger.info('Sending notifications', notifications)
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
