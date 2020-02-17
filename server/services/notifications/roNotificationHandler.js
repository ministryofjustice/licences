/**
 * @template T
 * @typedef {import("../../../types/licences").Result<T>} Result
 */
/**
 * @typedef {import("../../../types/licences").RoContactDetailsService} RoContactDetailsService
 * @typedef {import("../../../types/licences").RoNotificationSender} RoNotificationSender
 * @typedef {import("../../../types/licences").PrisonerService} PrisonerService
 * @typedef {import("../../../types/licences").WarningClient} WarningClient
 * @typedef {import("../../../types/delius").DeliusClient} DeliusClient
 * @typedef {import("../../../types/licences").Error} Error
 * @typedef {import("../../../types/licences").ResponsibleOfficerAndContactDetails} ResponsibleOfficerAndContactDetails
 */
const { sendingUserName } = require('../../utils/userProfile')
const logger = require('../../../log.js')
const { isEmpty, unwrapResult } = require('../../utils/functionalHelpers')
const { STAFF_NOT_LINKED, MISSING_PRISON } = require('../serviceErrors')

/**
 * @param {RoContactDetailsService} roContactDetailsService
 * @param {RoNotificationSender} roNotificationSender
 * @param {PrisonerService} prisonerService
 * @param {WarningClient} warningClient
 * @param {DeliusClient} deliusClient
 * @param {import('./eventPublisher')} eventPublisher
 */
module.exports = function createRoNotificationHandler(
  roNotificationSender,
  licenceService,
  prisonerService,
  roContactDetailsService,
  warningClient,
  deliusClient,
  eventPublisher
) {
  /** Need to alert staff to link the records manually otherwise we won't be able to access the RO's email address from their user record and so won't be able to notify them  */
  async function raiseUnlinkedAccountWarning(bookingId, { deliusId, name, nomsNumber }) {
    logger.info(`Staff and user records not linked in delius: ${deliusId}`)
    await warningClient.raiseWarning(
      bookingId,
      STAFF_NOT_LINKED,
      `RO with delius staff code: '${deliusId}' and name: '${name}', responsible for managing: '${nomsNumber}', has unlinked staff record in delius`
    )
  }

  /**
   *  We know that the RO user handling this case requires the Delius RO role to be able to access licences
   *  Attempt the idemptotent operation to add it now.
   * @param {string} bookingId
   * @param {ResponsibleOfficerAndContactDetails} responsibleOfficer
   * @return {Promise<void>}
   */
  async function assignDeliusRoRole(bookingId, responsibleOfficer) {
    if (responsibleOfficer.username) {
      logger.info(`Assigning responsible officer role to ${responsibleOfficer.username} for booking id: ${bookingId}`)
      await deliusClient.addResponsibleOfficerRole(responsibleOfficer.username)
    }
  }

  /**
   * @typedef {{ prison: string, agencyId: string, responsibleOfficer: ResponsibleOfficerAndContactDetails }} RoAndPrison
   * @return {Promise<Result<RoAndPrison>>}
   */
  async function loadResponsibleOfficer(bookingId, token) {
    /** @type {[{premise: string, agencyId: string}, Result<ResponsibleOfficerAndContactDetails>]} */
    const [establishment, result] = await Promise.all([
      prisonerService.getEstablishmentForPrisoner(bookingId, token),
      roContactDetailsService.getResponsibleOfficerWithContactDetails(bookingId, token),
    ])

    const [responsibleOfficer, error] = unwrapResult(result)

    if (error) {
      return error
    }

    const { premise: prison, agencyId } = establishment || {}
    if (isEmpty(prison)) {
      logger.error(`Missing prison for bookingId: ${bookingId}`)
      return { message: `Missing prison for bookingId: ${bookingId}`, code: MISSING_PRISON }
    }
    return { prison, agencyId, responsibleOfficer }
  }

  return {
    async sendRo({ transition, bookingId, token, user }) {
      const [responsibleOfficerAndPrison, error] = unwrapResult(await loadResponsibleOfficer(bookingId, token))

      if (error) {
        logger.error(`Problem retrieving contact details: ${error.message}`)
        return
      }

      const { prison, agencyId, responsibleOfficer } = responsibleOfficerAndPrison

      if (responsibleOfficer.isUnlinkedAccount) {
        await raiseUnlinkedAccountWarning(bookingId, responsibleOfficer)
      }

      await licenceService.markForHandover(bookingId, transition.type)

      await eventPublisher.raiseCaseHandover({
        username: user.username,
        bookingId,
        transitionType: transition.type,
        submissionTarget: responsibleOfficer,
        source: {
          type: 'prison',
          agencyId,
        },
        target: {
          type: 'probation',
          probationAreaCode: responsibleOfficer.probationAreaCode,
          lduCode: responsibleOfficer.lduCode,
        },
      })

      await roNotificationSender.sendNotifications({
        bookingId,
        responsibleOfficer,
        prison,
        notificationType: transition.notificationType,
        sendingUserName: sendingUserName(user),
      })

      await assignDeliusRoRole(bookingId, responsibleOfficer)
    },

    /**
     * Once an unlinked account has been linked, this provides a mechanism to re-send the RO email.
     */
    async sendRoEmail({ transition, bookingId, token, user }) {
      const [responsibleOfficerAndPrison, error] = unwrapResult(await loadResponsibleOfficer(bookingId, token))

      if (error) {
        return error
      }

      const { prison, responsibleOfficer } = responsibleOfficerAndPrison

      if (responsibleOfficer.isUnlinkedAccount) {
        return { code: STAFF_NOT_LINKED, message: `User is not linked for bookingId: ${bookingId}` }
      }

      await roNotificationSender.sendNotifications({
        bookingId,
        responsibleOfficer,
        prison,
        notificationType: transition.notificationType,
        sendingUserName: sendingUserName(user),
      })

      await assignDeliusRoRole(bookingId, responsibleOfficer)
      return responsibleOfficer
    },
  }
}
