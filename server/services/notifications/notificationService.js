/**
 * @template T
 * @typedef {import("../../../types/licences").Result<T>} Result
 */
/**
 * @typedef {import("../../../types/licences").RoContactDetailsService} RoContactDetailsService
 * @typedef {import("../../../types/licences").RoNotificationSender} RoNotificationSender
 * @typedef {import("../../../types/licences").PrisonerService} PrisonerService
 * @typedef {import("../../../types/licences").WarningClient} WarningClient
 * @typedef {import("../../../types/licences").Error} Error
 * @typedef {import("../../../types/licences").ResponsibleOfficerAndContactDetails} ResponsibleOfficerAndContactDetails
 */
const { sendingUserName } = require('../../utils/userProfile')
const logger = require('../../../log.js')
const { isEmpty, unwrapResult } = require('../../utils/functionalHelpers')
const { STAFF_NOT_LINKED } = require('../serviceErrors')

/**
 * @param {RoContactDetailsService} roContactDetailsService
 * @param {RoNotificationSender} roNotificationSender
 * @param {PrisonerService} prisonerService
 * @param {WarningClient} warningClient
 */
module.exports = function createNotificationService(
  roNotificationSender,
  caAndDmNotificationSender,
  audit,
  licenceService,
  prisonerService,
  roContactDetailsService,
  warningClient
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
    /** @type {[{premise: string}, Result<ResponsibleOfficerAndContactDetails>]} */
    const [establishment, result] = await Promise.all([
      prisonerService.getEstablishmentForPrisoner(bookingId, token),
      roContactDetailsService.getResponsibleOfficerWithContactDetails(bookingId, token),
    ])

    const [responsibleOfficer, error] = unwrapResult(result)

    if (error) {
      logger.error(`Problem retrieving contact details: ${error.message}`)
      return
    }

    const { premise: prison } = establishment || {}
    if (isEmpty(prison)) {
      logger.error(`Missing prison for bookingId: ${bookingId}`)
      return
    }

    if (responsibleOfficer.isUnlinkedAccount) {
      await raiseUnlinkedAccountWarning(bookingId, responsibleOfficer)
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

  /** Need to alert staff to link the records manually otherwise we won't be able to access the RO's email address from their user record and so won't be able to notify them  */
  async function raiseUnlinkedAccountWarning(bookingId, { deliusId, name, nomsNumber }) {
    logger.info(`Staff and user records not linked in delius: ${deliusId}`)
    await warningClient.raiseWarning(
      bookingId,
      STAFF_NOT_LINKED,
      `RO with delius staff code: '${deliusId}' and name: '${name}', responsible for managing: '${nomsNumber}', has unlinked staff record in delius`
    )
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
