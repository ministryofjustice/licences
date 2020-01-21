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
      const { content: probationAreas } = await deliusClient.getAllProbationAreas()
      probationAreas.sort((a, b) => a.description.localeCompare(b.description, 'en', { ignorePunctuation: true }))
      return probationAreas
    },

    async getProbationArea(probationAreaCode) {
      const { content: probationAreas } = await deliusClient.getAllProbationAreas()
      const probationAreaDescription = probationAreas.find(area => probationAreaCode === area.code).description

      const activeLdus = await activeLduClient.allActiveLdusInArea(probationAreaCode)
      const activeLdusCodes = activeLdus.map(ldu => ldu.code)

      const { content: ldus = [] } = await deliusClient.getAllLdusForProbationArea(probationAreaCode)

      const allLdus = ldus.map(ldu => ({
        code: ldu.code,
        description: ldu.description,
        active: activeLdusCodes.includes(ldu.code),
      }))

      const probationArea = {
        code: probationAreaCode,
        description: probationAreaDescription,
        ldus: allLdus,
      }

      return probationArea
    },

    async updateActiveLdus(probationAreaCode, activeLdus) {
      await activeLduClient.updateActiveLdu(probationAreaCode, activeLdus)
      logger.info('active_local_delivery_units table updated with user selected LDUs')
    },
  }
}
