import { DeliusClient } from '../../types/delius'
import config from '../config'

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

    async getAllOffenderManagers(offenderNo) {
      return (await restClient.getResource(`/offenders/nomsNumber/${offenderNo}/allOffenderManagers`)) || []
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
      try {
        await restClient.putResource(`/users/${username}/roles/${config.delius.responsibleOfficerRoleId}`, '')
      } catch (error) {
        // Do nothing
      }
    },
  }
}
