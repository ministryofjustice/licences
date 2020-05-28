import R from 'ramda'
import { ProbationTeamsClient } from '../../types/probationTeams'
import logger from '../../log'

// eslint-disable-next-line import/prefer-default-export
export const createProbationTeamsClient = (restClient): ProbationTeamsClient => {
  return {
    async getFunctionalMailbox({ probationAreaCode, lduCode, teamCode }) {
      const ldu = await this.getLduWithProbationTeams({ probationAreaCode, lduCode })
      const teamAddress = R.path(['probationTeams', teamCode, 'functionalMailbox'], ldu)
      const functionalMailbox = teamAddress || (ldu && ldu.functionalMailbox)
      if (!functionalMailbox) {
        logger.info(
          `Could not find functional mailbox for the probation area code ${probationAreaCode} having an ldu code: ${lduCode} or team code: ${teamCode}`
        )
      }
      return functionalMailbox
    },

    async getProbationAreaCodes() {
      return restClient.getResource(`/probation-area-codes`)
    },

    async getLduWithProbationTeams({ probationAreaCode, lduCode }) {
      return restClient.getResource(`/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}`)
    },

    async getProbationArea(probationAreaCode) {
      return restClient.getResource(`/probation-areas/${probationAreaCode}`)
    },

    async deleteLduFunctionalMailbox({ probationAreaCode, lduCode }): Promise<void> {
      await restClient.deleteResource(
        `/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}/functional-mailbox`
      )
    },

    async setLduFunctionalMailbox({ probationAreaCode, lduCode }, proposedFunctionalMailbox): Promise<void> {
      await restClient.putResource(
        `/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}/functional-mailbox`,
        `"${proposedFunctionalMailbox}"`
      )
    },

    async deleteProbationTeamFunctionalMailbox({ probationAreaCode, lduCode, teamCode }): Promise<void> {
      await restClient.deleteResource(
        `/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}/teams/${teamCode}/functional-mailbox`
      )
    },

    async setProbationTeamFunctionalMailbox(
      { probationAreaCode, lduCode, teamCode },
      proposedFunctionalMailbox
    ): Promise<void> {
      await restClient.putResource(
        `/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}/teams/${teamCode}/functional-mailbox`,
        `"${proposedFunctionalMailbox}"`
      )
    },
  }
}
