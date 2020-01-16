const logger = require('../../log')
/**
 * @typedef {import("../../types/licences").LduService} LduService
 * @typedef {import("../../types/licences").ActiveLduClient} ActiveLduClient
 * @typedef {import("../../types/delius").DeliusClient} DeliusClient
 */

/**
 * @param {DeliusClient} deliusClient
 * @param {ActiveLduClient} activeLduClient
 * @return {LduService}
 */
module.exports = function createLduService(deliusClient, activeLduClient) {
  return {
    async getAllProbationAreas() {
      return deliusClient.getAllProbationAreas()
    },

    async getLdusForProbationArea(probationAreaCode) {
      const allLdus = await deliusClient.getAllLdusForProbationArea(probationAreaCode)
      const activeLdus = await activeLduClient.allActiveLdusInArea(probationAreaCode)
      const activeLdusCodes = activeLdus.map(ldu => ldu.code)

      return allLdus.map(ldu => ({
        code: ldu.code,
        description: ldu.description,
        active: activeLdusCodes.includes(ldu.code),
      }))
    },

    async updateActiveLdus(probationAreaCode, activeLdus) {
      await activeLduClient.updateActiveLdu(probationAreaCode, activeLdus)
      logger.info('active_local_delivery_units table updated with user selected LDUs')
    },
  }
}
