/**
 * @typedef {import("../../types/licences").RoService} RoService
 * @typedef {import("../../types/probationTeams").ProbationTeamsClient} ProbationTeamsClient
 * @typedef {import("../../types/licences").RoContactDetailsService} RoContactDetailsService
 * @typedef {import("../../types/licences").Error} Error
 * @typedef {import("../../types/licences").ResponsibleOfficer} ResponsibleOfficer
 * @typedef {import("../../types/delius").StaffDetails} StaffDetails
 * @typedef {import("../../types/licences").ResponsibleOfficerAndContactDetails} ResponsibleOfficerAndContactDetails
 */
const { isEmpty, unwrapResult } = require('../utils/functionalHelpers')
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
   * @typedef DeliusContactDetails
   * @property {string} email
   * @property {string} username
   * @property {string} functionalMailbox
   * @property {boolean} isUnlinkedAccount
   * @property {string} organisation
   *
  
  /**
   * @param {any} locallyStoredRo
   * @return {DeliusContactDetails}
   */
  function extractContactDetails(locallyStoredRo) {
    const { email, orgEmail, organisation, deliusId } = locallyStoredRo
    logIfMissing(orgEmail, `Missing orgEmail for RO: ${deliusId}`)
    logIfMissing(email, `Missing email for RO: ${deliusId}`)
    logIfMissing(organisation, `Missing organisation for RO: ${deliusId}`)

    return {
      isUnlinkedAccount: false,
      username: undefined,
      email,
      functionalMailbox: orgEmail,
      organisation,
    }
  }

  /**
   * @param {ResponsibleOfficer} ro
   * @returns {Promise<Error| DeliusContactDetails>}
   */
  async function getContactDetailsFromDelius(ro) {
    const { deliusId, probationAreaCode, lduCode, lduDescription, teamCode } = ro
    logger.info(`looking up staff by code: ${deliusId}`)
    const [staff, error] = unwrapResult(await roService.getStaffByCode(deliusId))
    if (error) {
      return error
    }

    // Check that we don't have a mapping for the delius username locally
    if (staff.username) {
      const localRo = await userAdminService.getRoUserByDeliusUsername(staff.username)
      if (localRo) {
        return { ...extractContactDetails(localRo), username: staff.username }
      }
    }

    const functionalMailbox = await probationTeamsClient.getFunctionalMailbox({
      probationAreaCode,
      lduCode,
      teamCode,
    })
    logger.info(
      `Got functional mailbox: '${functionalMailbox}' for probation area '${probationAreaCode}', ldu ${lduCode}, team ${teamCode}'`,
      staff
    )
    return {
      isUnlinkedAccount: staff.username === undefined,
      username: staff.username,
      email: staff.email,
      functionalMailbox,
      organisation: `${lduDescription} (${lduCode})`,
    }
  }

  return {
    async getResponsibleOfficerWithContactDetails(bookingId, token) {
      const [deliusRo, error] = unwrapResult(await roService.findResponsibleOfficer(bookingId, token))

      if (error) {
        return error
      }

      const localRo = await userAdminService.getRoUserByDeliusId(deliusRo.deliusId)

      if (localRo) {
        return { ...deliusRo, ...extractContactDetails(localRo) }
      }

      const [deliusContactDetails, staffLookupError] = unwrapResult(await getContactDetailsFromDelius(deliusRo))

      if (staffLookupError) {
        return staffLookupError
      }

      return {
        ...deliusRo,
        ...deliusContactDetails,
      }
    },

    async getFunctionalMailBox(bookingId, token) {
      const [roOfficer, error] = unwrapResult(await this.getResponsibleOfficerWithContactDetails(bookingId, token))

      if (error) {
        logger.error(`Failed to retrieve RO for booking id: '${bookingId}'`, error.message)
        return null
      }

      return roOfficer.functionalMailbox
    },
  }
}
