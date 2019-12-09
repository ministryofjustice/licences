/**
 * @typedef {import("../../types/licences").RoService} RoService
 * @typedef {import("../../types/licences").RoContactDetailsService} RoContactDetailsService
 * @typedef {import("../../types/licences").Error} Error
 * @typedef {import("../../types/licences").ResponsibleOfficer} ResponsibleOfficer
 * @typedef {import("../../types/licences").ResponsibleOfficerAndContactDetails} ResponsibleOfficerAndContactDetails
 */
const R = require('ramda')
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
 * @return {RoContactDetailsService}
 */
module.exports = function createRoContactDetailsService(userAdminService, roService) {
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

  return {
    async getFunctionalMailBox(deliusId) {
      const ro = await userAdminService.getRoUserByDeliusId(deliusId)

      if (ro) {
        const orgEmail = R.prop('orgEmail', ro)
        logIfMissing(orgEmail, `Missing orgEmail for RO: ${deliusId}`)
        return orgEmail
      }

      // TODO look up in delius and use LDU to look up org email in probation teams service
      logger.error(`RO with ${deliusId} is not mapped in licences`)
      return null
    },

    async getResponsibleOfficerWithContactDetails(bookingId, token) {
      const result = await roService.findResponsibleOfficer(bookingId, token)

      const error = /** @type { Error } */ (result)
      if (error.message) {
        return error
      }

      const deliusRo = /** @type { ResponsibleOfficer } */ (result)

      const localDetails = await getLocallyStoredContactDetails(deliusRo)

      if (localDetails) {
        return localDetails
      }

      const staff = await roService.getStaffByCode(deliusRo.deliusId)

      if (!staff) {
        return { message: `Staff does not exist in delius: ${deliusRo.deliusId}` }
      }

      if (!staff.email || !staff.username) {
        return { message: `Staff and user not linked in delius: ${deliusRo.deliusId}` }
      }

      // TODO populate organisation and functional mailbox
      return { ...deliusRo, email: staff.email }
    },
  }
}
