/**
 * @typedef {import("../../../types/licences").PrisonerService} PrisonerService
 */
const { sendingUserName } = require('../../utils/userProfile')

/**
 * @param {PrisonerService} prisonerService
 */
module.exports = function createNotificationService(
  caAndDmNotificationSender,
  audit,
  licenceService,
  prisonerService,
  roNotificationHandler
) {
  const receiverToSender = {
    RO: roNotificationHandler.sendRo,
    CA: sendCaOrDm,
    DM: sendCaOrDm,
  }

  async function send({ transition, bookingId, token, licence, prisoner, user }) {
    return receiverToSender[transition.receiver]({ transition, bookingId, token, licence, prisoner, user })
  }

  async function sendCaOrDm({ transition, bookingId, token, licence, prisoner, user }) {
    const submissionTarget = await prisonerService.getOrganisationContactDetails(transition.receiver, bookingId, token)

    await licenceService.markForHandover(bookingId, transition.type)

    if (transition.type === 'dmToCaReturn') {
      await licenceService.removeDecision(bookingId, licence)
    }

    auditEvent(user.username, bookingId, transition.type, submissionTarget)

    caAndDmNotificationSender.sendNotifications({
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
