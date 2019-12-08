/**
 * @template T
 * @typedef {import("../../types/licences").Result<T>} Result
 */
/**
 * @typedef {import("../../types/licences").RoService} RoService
 * @typedef {import("../data/probationTeamsClient").ProbationTeamsClient} ProbationTeamsClient
 * @typedef {import("../../types/licences").RoContactDetailsService} RoContactDetailsService
 * @typedef {import("../../types/licences").Error} Error
 * @typedef {import("../../types/licences").ResponsibleOfficer} ResponsibleOfficer
 * @typedef {import("../../types/delius").StaffDetails} StaffDetails
 * @typedef {import("../../types/licences").ResponsibleOfficerAndContactDetails} ResponsibleOfficerAndContactDetails
 */
const { isEmpty } = require('../utils/functionalHelpers')
const logger = require('../../log.js')

const logIfMissing = (val, message) => {
  if (isEmpty(val)) {
    logger.error(message)
  }
}

/**
 * @param {any} userAdminService
 * @param {RoService} roService
 * @param {ProbationTeamsClient} probationTeamsClient
 * @return {RoContactDetailsService}
 */
module.exports = function createRoContactDetailsService(userAdminService, roService, probationTeamsClient) {
  /**
   * @template T
   * @param {Result<T>} result
   * @returns {[T?, error?]};
   ]}
   */
  function unwrapError(result) {
    const error = /** @type { Error } */ (result)
    const success = /** @type { T } */ (result)
    return [!error.message && success, error.message && error]
  }

  /**
   * @param {ResponsibleOfficer} deliusRo
   * @return {Promise<ResponsibleOfficerAndContactDetails>}
   */
  async function getLocallyStoredContactDetails(deliusRo) {
    const { deliusId } = deliusRo
    const ro = await userAdminService.getRoUserByDeliusId(deliusId)

    if (!ro) {
      return null
    }
    const { email, orgEmail, organisation } = ro
    logIfMissing(orgEmail, `Missing orgEmail for RO: ${deliusId}`)
    logIfMissing(email, `Missing email for RO: ${deliusId}`)
    logIfMissing(organisation, `Missing organisation for RO: ${deliusId}`)

    return {
      ...deliusRo,
      email,
      functionalMailbox: orgEmail,
      organisation,
    }
  }

  /**
   * @typedef Mailboxes
   * @property {string} email
   * @property {string} functionalMailbox
   *
   * @param {string} deliusId
   * @param {string} lduCode
   * @returns {Promise<Error| Mailboxes>}
   */
  async function getMailboxes(deliusId, lduCode) {
    const [staff, error] = unwrapError(await roService.getStaffByCode(deliusId))
    return (
      error || {
        email: staff.email,
        functionalMailbox: await probationTeamsClient.getFunctionalMailbox(lduCode),
      }
    )
  }

  return {
    async getResponsibleOfficerWithContactDetails(bookingId, token) {
      const [deliusRo, error] = unwrapError(await roService.findResponsibleOfficer(bookingId, token))

      if (error) {
        return error
      }

      const localDetails = await getLocallyStoredContactDetails(deliusRo)

      if (localDetails) {
        return localDetails
      }

      const [mailboxes, mailboxesError] = unwrapError(await getMailboxes(deliusRo.deliusId, deliusRo.lduCode))

      if (mailboxesError) {
        return mailboxesError
      }

      return {
        ...deliusRo,
        email: mailboxes.email,
        functionalMailbox: mailboxes.functionalMailbox,
        organisation: deliusRo.lduDescription, // TODO: check this
      }
    },

    async getFunctionalMailBox(bookingId, token) {
      const [roOfficer, error] = unwrapError(await this.getResponsibleOfficerWithContactDetails(bookingId, token))

      if (error) {
        logger.error(`Failed to retrieve RO for booking id: '${bookingId}'`, error.message)
        return null
      }

      return roOfficer.functionalMailbox
    },
  }
}
