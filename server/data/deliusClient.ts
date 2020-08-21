import { DeliusClient } from '../../types/delius'
import config from '../config'
import user from '../routes/user'

// eslint-disable-next-line import/prefer-default-export
export const createDeliusClient = (restClient): DeliusClient => {
  return {
    getStaffDetailsByStaffCode(staffCode) {
      return restClient.getResource(`/staff/staffCode/${staffCode}`)
    },

    getStaffDetailsByUsername(username) {
      return restClient.getResource(`/staff/username/${username}`)
    },

    getROPrisoners(deliusStaffCode) {
      return restClient.getResource(`/staff/staffCode/${deliusStaffCode}/managedOffenders`)
    },

    getAllOffenderManagers(offenderNo) {
      return restClient.getResource(`/offenders/nomsNumber/${offenderNo}/allOffenderManagers`)
    },

    getAllProbationAreas() {
      return restClient.getResource(`/probationAreas?excludeEstablishments=true&active=true`)
    },

    async getAllLdusForProbationArea(probationAreaCode) {
      const ldus = await restClient.getResource(`/probationAreas/code/${probationAreaCode}/localDeliveryUnits`)
      return ldus?.content ? ldus : { content: [] }
    },

    async getAllTeamsForLdu(probationAreaCode, lduCode) {
      const teams = await restClient.getResource(
        `/probationAreas/code/${probationAreaCode}/localDeliveryUnits/code/${lduCode}/teams`
      )
      return teams?.content ? teams : { content: [] }
    },

    async addResponsibleOfficerRole(username) {
      await this.addRole(username, config.delius.responsibleOfficerRoleId)
    },

    async addRole(username, code) {
      try {
        await restClient.putResource(`/users/${username}/roles/${code}`, '')
      } catch (error) {
        // Do nothing
      }
    },

    async getUser(username) {
      return restClient.getResource(`/users/${username}/details`)
    },
  }
}
