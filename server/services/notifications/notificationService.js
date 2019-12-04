/**
 * @typedef {import("../../../types/licences").RoContactDetailsService} RoContactDetailsService
 * @typedef {import("../../../types/licences").RoNotificationSender} RoNotificationSender
 * @typedef {import("../../../types/licences").Error} Error
 * @typedef {import("../../../types/licences").ResponsibleOfficerAndContactDetails} ResponsibleOfficerAndContactDetails
 */
const { sendingUserName } = require('../../utils/userProfile')
const logger = require('../../../log.js')
const { isEmpty } = require('../../utils/functionalHelpers')

/**
 * @param {RoContactDetailsService} roContactDetailsService
 * @param {RoNotificationSender} roNotificationSender
 */
module.exports = function createNotificationService(
  roNotificationSender,
  caAndDmNotificationSender,
  audit,
  licenceService,
  prisonerService,
  roContactDetailsService
) {
  const receiverToSender = {
    RO: sendRo,
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

  async function sendRo({ transition, bookingId, token, user }) {
    const [{ premise: prison }, result] = await Promise.all([
      prisonerService.getEstablishmentForPrisoner(bookingId, token),
      roContactDetailsService.getResponsibleOfficerWithContactDetails(bookingId, token),
    ])

    const error = /** @type { Error } */ (result)
    if (error.message) {
      logger.error(`Problem retrieving contact details: ${error.message}`)
      return
    }

    const responsibleOfficer = /** @type { ResponsibleOfficerAndContactDetails } */ (result)

    if (isEmpty(prison)) {
      logger.error(`Missing prison for bookingId: ${bookingId}`)
      return
    }

    await licenceService.markForHandover(bookingId, transition.type)

    auditEvent(user.username, bookingId, transition.type, responsibleOfficer)

    roNotificationSender.sendNotifications({
      bookingId,
      responsibleOfficer,
      prison,
      notificationType: transition.notificationType,
      sendingUserName: sendingUserName(user),
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
