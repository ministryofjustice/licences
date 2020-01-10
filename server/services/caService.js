/**
 * @template T
 * @typedef {import("../../types/licences").Result<T>} Result
 */
/**
 * @typedef {import("../../types/licences").Error} Error
 * @typedef {import("../../types/licences").CaService} CaService
 * @typedef {import("../../types/licences").RoService} RoService
 *  @typedef {import("../data/activeLduClient")} ActiveLduClient
 */

const logger = require('../../log.js')
const { unwrapResult } = require('../utils/functionalHelpers')
const { NO_OFFENDER_NUMBER, LDU_INACTIVE, NO_COM_ASSIGNED, COM_NOT_ALLOCATED } = require('./serviceErrors')

/**
 * @param {RoService} roService
 * @param {ActiveLduClient} activeLduClient
 * @param {boolean} preventCaToRoHandoverOnInactiveLdusFlag
 * @returns {CaService} caService
 */
module.exports = function createCaService(roService, activeLduClient, preventCaToRoHandoverOnInactiveLdusFlag) {
  return {
    async getReasonForNotContinuing(bookingId, token) {
      if (!preventCaToRoHandoverOnInactiveLdusFlag) {
        return null
        // When this feature is disabled, we never block the CA from continuing the case
      }

      const [ro, error] = unwrapResult(await roService.findResponsibleOfficer(bookingId, token))

      if (error) {
        logger.info(
          `Found reason for not continuing processing booking: ${bookingId}, error: ${error.code}:${error.message}`
        )
        switch (error.code) {
          case NO_OFFENDER_NUMBER:
            return NO_OFFENDER_NUMBER
          case NO_COM_ASSIGNED:
            // Handle NO_COM_ASSIGNED and COM_NOT_ALLOCATED in the same way
            return COM_NOT_ALLOCATED
          default:
            throw new Error(`Unexpected error received: ${error.code}: ${error.message}`)
        }
      }

      const { lduCode, isAllocated, probationAreaCode } = ro

      const isLduActive = await activeLduClient.isLduPresent(lduCode, probationAreaCode)

      if (!isLduActive) {
        return LDU_INACTIVE
      }

      if (!isAllocated) {
        return COM_NOT_ALLOCATED
      }

      return null
    },
  }
}
