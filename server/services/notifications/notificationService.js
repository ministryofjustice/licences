const { sendingUserName } = require('../../utils/userProfile')

module.exports = function createNotificationService(
  roNotificationSender,
  caAndDmNotificationSender,
  audit,
  licenceService,
  prisonerService
) {
  async function send({ transition, bookingId, token, licence, prisoner, user }) {
    const submissionTarget = await prisonerService.getOrganisationContactDetails(transition.receiver, bookingId, token)

    await licenceService.markForHandover(bookingId, transition.type)

    if (transition.type === 'dmToCaReturn') {
      await licenceService.removeDecision(bookingId, licence)
    }

    auditEvent(user.username, bookingId, transition.type, submissionTarget)

    const sender = transition.receiver === 'RO' ? roNotificationSender : caAndDmNotificationSender

    sender.sendNotifications({
      bookingId,
      prisoner,
      notificationType: transition.notificationType,
      submissionTarget,
      sendingUserName: sendingUserName(user),
      token,
    })
  }

  function auditEvent(user, bookingId, transitionType, submissionTarget) {
    audit.record('SEND', user, {
      bookingId,
      transitionType,
      submissionTarget,
    })
  }

  return {
    send,
  }
}
