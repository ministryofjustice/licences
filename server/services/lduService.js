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
      // return an array of strings showing the active ldu's in the probation area. Need these to put ticks in the checkboxes
    },

    async updateActiveLdus() {
      // async updateActiveLdus({ code, active }) {
      // TODO
      // convert input from front-end to array if not already an array
      // only the ldus that are ticked should go to db.
      // unticked ldus must be removed from db
      // need the probationAreaCode and the ldu code associated to each tick
      // do db stuff in the dao layer
    },
  }
}
