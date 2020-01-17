/**
 * @typedef {import("../../types/licences").RoService} RoService
 * @typedef {import("../data/probationTeamsClient").ProbationTeamsClient} ProbationTeamsClient
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
 * @param {boolean} preventCaToRoHandoverOnInactiveLdusFlag
 * @return {RoContactDetailsService}
 */
module.exports = function createRoContactDetailsService(
  userAdminService,
  roService,
  probationTeamsClient,
  preventCaToRoHandoverOnInactiveLdusFlag
) {
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
      isUnlinkedAccount: false,
      username: undefined,
      email,
      functionalMailbox: orgEmail,
      organisation,
    }
  }

  /**
   * @typedef DeliusContactDetails
   * @property {string} email
   * @property {string} username
   * @property {string} functionalMailbox
   * @property {boolean} isUnlinkedAccount
   *
   * @param {string} deliusId
   * @param {string} probationAreaCode
   * @param {string} lduCode
   * @param {string} teamCode
   * @returns {Promise<Error| DeliusContactDetails>}
   */
  async function getContactDetailsFromDelius(deliusId, probationAreaCode, lduCode, teamCode) {
    if (!preventCaToRoHandoverOnInactiveLdusFlag) {
      logger.info(`Looking up contact details from delius for: ${deliusId} is currently disabled`)
      return {
        isUnlinkedAccount: false,
        username: undefined,
        email: undefined,
        functionalMailbox: undefined,
      }
    }

    logger.info(`looking up staff by code: ${deliusId}`)
    const [staff, error] = unwrapResult(await roService.getStaffByCode(deliusId))
    if (error) {
      return error
    }
    const functionalMailbox = await probationTeamsClient.getFunctionalMailbox(probationAreaCode, lduCode, teamCode)
    logger.info(
      `Got functional mailbox: '${functionalMailbox}' for probation area '${probationAreaCode}', ldu ${lduCode}, team ${teamCode}'`,
      staff
    )
    return {
      isUnlinkedAccount: staff.username === undefined,
      username: staff.username,
      email: staff.email,
      functionalMailbox,
    }
  }

  return {
    async getResponsibleOfficerWithContactDetails(bookingId, token) {
      const [deliusRo, error] = unwrapResult(await roService.findResponsibleOfficer(bookingId, token))

      if (error) {
        return error
      }

      const localContactDetails = await getLocallyStoredContactDetails(deliusRo)

      if (localContactDetails) {
        return localContactDetails
      }

      const [deliusContactDetails, staffLookupError] = unwrapResult(
        await getContactDetailsFromDelius(
          deliusRo.deliusId,
          deliusRo.probationAreaCode,
          deliusRo.lduCode,
          deliusRo.teamCode
        )
      )

      if (staffLookupError) {
        return staffLookupError
      }

      return {
        ...deliusRo,
        isUnlinkedAccount: deliusContactDetails.isUnlinkedAccount,
        email: deliusContactDetails.email,
        username: deliusContactDetails.username,
        functionalMailbox: deliusContactDetails.functionalMailbox,
        organisation: `${deliusRo.lduDescription} (${deliusRo.lduCode})`,
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
