const logger = require('../../log')
/**
 * @typedef {import("../../types/licences").LduService} LduService
 * @typedef {import("../../types/licences").ActiveLduClient} lduActiveClient
 * @typedef {import("../../types/delius").DeliusClient} DeliusClient
 */

/**
 * @param {DeliusClient} deliusClient
 * @return {LduService}
 */

module.exports = function createLduService(deliusClient, lduActiveClient) {
  return {
    async getAllProbationAreas() {
      return deliusClient.getAllProbationAreas()
    },

    async getLdusForProbationArea(probationAreaCode) {
      return deliusClient.getAllLdusForProbationArea(probationAreaCode)
    },

    async getActiveLdusForProbationArea(probationAreaCode) {
      return lduActiveClient.allActiveLdusInArea(probationAreaCode)
    },

    async updateActiveLdus(probationAreaCode, activeLdus) {
      // to update the active_local_delivery_units with only active LDUs
      const successLogMsg = 'active_local_delivery_units table updated with user selected LDUs'
      const failureLogMsg = 'Could not update active_local_delivery_units with user selected LDUs'
      let activeLdusArray = activeLdus
      let activeLduCodes

      if (!Array.isArray(activeLdus)) {
        activeLdusArray = [activeLdus]
      }

      if (activeLdusArray.length > 0) {
        activeLduCodes = activeLdusArray.map(ldu => ldu.code)
      }

      const dbResponse = await lduActiveClient
        .updateWithActiveLdu(probationAreaCode, activeLduCodes)
        .then(() => {
          logger.info(`${successLogMsg}`)
          return true
        })
        .catch(e => {
          logger.error(`${failureLogMsg} ${e.message}`)
          return false
        })

      return dbResponse
    },
  }
}
