/**
 * @typedef {import("../../../types/licences").PrisonerService} PrisonerService
 */
const { sendingUserName } = require('../../utils/userProfile')

/**
 * @param {PrisonerService} prisonerService
 * @param {import('./EventPublisher')} eventPublisher
 */
module.exports = function createNotificationService(
  caAndDmNotificationSender,
  licenceService,
  prisonerService,
  roNotificationHandler,
  eventPublisher
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
    const { submissionTarget, source, target } = await prisonerService.getDestinations(
      transition.sender,
      transition.receiver,
      bookingId,
      token
    )

    await licenceService.markForHandover(bookingId, transition.type)

    if (transition.type === 'dmToCaReturn') {
      await licenceService.removeDecision(bookingId, licence)
    }

    await eventPublisher.raiseCaseHandover({
      username: user.username,
      bookingId,
      transitionType: transition.type,
      submissionTarget,
      source,
      target,
    })

    caAndDmNotificationSender.sendNotifications({
      bookingId,
      prisoner,
      notificationType: transition.notificationType,
      submissionTarget,
      sendingUserName: sendingUserName(user),
      token,
    })
  }

  return {
    send,
  }
}
