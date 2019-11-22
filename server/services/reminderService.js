const logger = require('../../log.js')
const { isEmpty } = require('../utils/functionalHelpers')

module.exports = function createReminderService(prisonerService, deadlineService, notificationService) {
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

  async function sendReminder(token, notificationType, bookingId, transitionDate) {
    const [submissionTarget, prisoner] = await getPrisonerData(bookingId, token)

    if (isEmpty(submissionTarget) || isEmpty(prisoner)) {
      return
    }

    notificationService.sendNotifications({
      prisoner,
      notificationType,
      submissionTarget,
      bookingId,
      sendingUserName: 'NOTIFICATION_SERVICE',
      token,
      transitionDate,
    })
  }

  async function sendReminders(token, licences, notificationType) {
    // This is intentionally sequential to avoid timeouts sometimes arising from multiple quick calls to NOMIS API
    await licences.reduce(async (previous, nextLicence) => {
      await previous
      return sendReminder(token, notificationType, nextLicence.booking_id, nextLicence.transition_date)
    }, Promise.resolve())
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

  return { notifyRoReminders }
}
