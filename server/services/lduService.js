const logger = require('../../log')
const { getIn } = require('../utils/functionalHelpers')
const { sortObjArrayAsc } = require('../utils/sort')

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
      const probationAreas = await deliusClient.getAllProbationAreas()
      sortObjArrayAsc(probationAreas)
      return probationAreas
    },

    async getLdusForProbationArea(probationAreaCode) {
      const allLdus = await deliusClient.getAllLdusForProbationArea(probationAreaCode)
      const activeLdus = await activeLduClient.allActiveLdusInArea(probationAreaCode)
      const activeLdusCodes = activeLdus.map(ldu => ldu.code)
      const probationAreaDescription = getIn(allLdus, [0, 'description'])
      const teams = getIn(allLdus, [0, 'teams']) || []

      const allLdusIncludingStatus = teams.map(team => ({
        code: team.code,
        description: team.description,
        active: activeLdusCodes.includes(team.code),
      }))

      return { probationAreaDescription, allLdusIncludingStatus }
    },

    async updateActiveLdus(probationAreaCode, activeLdus) {
      await activeLduClient.updateActiveLdu(probationAreaCode, activeLdus)
      logger.info('active_local_delivery_units table updated with user selected LDUs')
    },
  }
}
