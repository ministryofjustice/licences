import superagent from 'superagent'
import R from 'ramda'
import { ProbationTeamsClient } from '../../types/probationTeams'
import logger from '../../log'
import config from '../config'
import { buildErrorHandler } from './clientErrorHandler'

const handleError = buildErrorHandler('probation-teams')

const timeoutSpec = {
  response: config.probationTeams.timeout.response,
  deadline: config.probationTeams.timeout.deadline,
}

const apiUrl = `${config.probationTeams.apiUrl}`
// eslint-disable-next-line import/prefer-default-export
export const createProbationTeamsClient = (signInService): ProbationTeamsClient => {
  async function getResource(path) {
    try {
      const token = await signInService.getAnonymousClientCredentialsTokens('probationTeams')
      if (!token) {
        throw Error('Failed to get token')
      }
      const result = await superagent
        .get(`${apiUrl}${path}`)
        .set('Authorization', `Bearer ${token.token}`)
        .timeout(timeoutSpec)
      return result.body
    } catch (error) {
      if (error.status === 404) {
        logger.info(`Not found calling probation-teams at path: '${path}', verb: 'GET'`, error.stack)
        return undefined
      }
      handleError(error, path)
      return undefined // unreachable
    }
  }

  async function deleteResource(path: string): Promise<void> {
    try {
      const token = await signInService.getAnonymousClientCredentialsTokens('probationTeams')
      await superagent.delete(`${apiUrl}${path}`).set('Authorization', `Bearer ${token.token}`).timeout(timeoutSpec)
    } catch (error) {
      if (error.status === 404) {
        logger.info(`Not found calling probation-teams at path: '${path}', verb: 'DELETE'`, error.stack)
        return
      }
      handleError(error, path, 'DELETE')
    }
  }

  async function putResource(path: string, body: string): Promise<void> {
    try {
      const token = await signInService.getAnonymousClientCredentialsTokens('probationTeams')

      await superagent
        .put(`${apiUrl}${path}`)
        .type('application/json')
        .set('Authorization', `Bearer ${token.token}`)
        .timeout(timeoutSpec)
        .send(body)
    } catch (error) {
      handleError(error, path, 'PUT')
    }
  }

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
      return getResource(`/probation-area-codes`)
    },

    async getLduWithProbationTeams({ probationAreaCode, lduCode }) {
      return getResource(`/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}`)
    },

    async getProbationArea(probationAreaCode) {
      return getResource(`/probation-areas/${probationAreaCode}`)
    },

    async deleteLduFunctionalMailbox({ probationAreaCode, lduCode }): Promise<void> {
      await deleteResource(`/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}/functional-mailbox`)
    },

    async setLduFunctionalMailbox({ probationAreaCode, lduCode }, proposedFunctionalMailbox): Promise<void> {
      await putResource(
        `/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}/functional-mailbox`,
        `"${proposedFunctionalMailbox}"`
      )
    },

    async deleteProbationTeamFunctionalMailbox({ probationAreaCode, lduCode, teamCode }): Promise<void> {
      await deleteResource(
        `/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}/teams/${teamCode}/functional-mailbox`
      )
    },

    async setProbationTeamFunctionalMailbox(
      { probationAreaCode, lduCode, teamCode },
      proposedFunctionalMailbox
    ): Promise<void> {
      await putResource(
        `/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}/teams/${teamCode}/functional-mailbox`,
        `"${proposedFunctionalMailbox}"`
      )
    },
  }
}
