const R = require('ramda')
const logger = require('../../log')

/**
 * @typedef {import("../../types/licences").LduService} LduService
 * @typedef {import("../../types/licences").ActiveLduClient} ActiveLduClient
 * @typedef {import("../data/deliusClient").DeliusClient} DeliusClient
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
      probationAreas.sort((a, b) => a.description.localeCompare(b.description, 'en', { ignorePunctuation: true }))
      return probationAreas
    },

    async getProbationArea(probationAreaCode) {
      const activeLdus = await activeLduClient.allActiveLdusInArea(probationAreaCode)
      const activeLdusCodes = activeLdus.map((ldu) => ldu.code)

      const { description, localAdminUnits: ldus } = await deliusClient.getProbationArea(probationAreaCode)

      const allLdus = ldus.map((ldu) => ({
        code: ldu.code,
        description: ldu.description,
        active: activeLdusCodes.includes(ldu.code),
      }))

      const uniqueLdus = [...Object.entries(R.groupBy(R.prop('code'), allLdus))]
        .sort(([lduCode1], [lduCode2]) => lduCode1.localeCompare(lduCode2))
        .map(([_, ldu]) => ldu.sort((ldu1, ldu2) => ldu1.description.localeCompare(ldu2.description))[0])

      return {
        code: probationAreaCode,
        description,
        ldus: uniqueLdus,
      }
    },

    async updateActiveLdus(probationAreaCode, activeLdus) {
      await activeLduClient.updateActiveLdu(probationAreaCode, activeLdus)
      logger.info('active_local_delivery_units table updated with user selected LDUs')
    },
  }
}
