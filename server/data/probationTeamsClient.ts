import superagent from 'superagent'
import R from 'ramda'
import { ProbationTeamsClient } from '../../types/probationTeams'
import logger from '../../log'
import config from '../config'

const timeoutSpec = {
  response: config.probationTeams.timeout.response,
  deadline: config.probationTeams.timeout.deadline,
}

const apiUrl = `${config.probationTeams.apiUrl}`
// eslint-disable-next-line import/prefer-default-export
export const createProbationTeamsClient = (signInService): ProbationTeamsClient => {
  async function getResource(path) {
    const token = await signInService.getAnonymousClientCredentialsTokens('probationTeams')
    if (!token) {
      throw Error(`Failed to get token when attempting to GET probationTeamsService: ${path}`)
    }

    try {
      logger.debug(`GET ${path}`)
      const result = await superagent.get(path).set('Authorization', `Bearer ${token.token}`).timeout(timeoutSpec)
      logger.debug(`GET ${path} -> ${result.status}`)

      return result.body
    } catch (error) {
      if (error.status === 404) {
        logger.debug('Returned 404', path, error.response, error.stack)
        return null
      }
      logger.warn('Error calling probationTeamsService', path, error.response, error.stack)
      throw error
    }
  }

  async function deleteResource(path: string) {
    const token = await signInService.getAnonymousClientCredentialsTokens('probationTeams')
    if (!token) {
      throw Error(`Failed to get token when attempting to GET probationTeamsService: ${path}`)
    }

    try {
      logger.debug(`DELETE ${path}`)
      const result = await superagent.delete(path).set('Authorization', `Bearer ${token.token}`).timeout(timeoutSpec)
      logger.debug(`DELETE ${path} -> ${result.status}`)
    } catch (error) {
      if (error.status === 404) {
        logger.debug('Returned 404', path, error.response, error.stack)
        return
      }
      logger.warn('Error calling probationTeamsService', path, error.response, error.stack)
      throw error
    }
  }

  async function putResource(path: string, body: string) {
    const token = await signInService.getAnonymousClientCredentialsTokens('probationTeams')
    if (!token) {
      throw Error(`Failed to get token when attempting to GET probationTeamsService: ${path}`)
    }

    try {
      logger.debug(`PUT ${path}`)

      const result = await superagent
        .put(path)
        .type('application/json')
        .set('Authorization', `Bearer ${token.token}`)
        .timeout(timeoutSpec)
        .send(body)

      logger.debug(`PUT ${path} -> ${result.status}`)
    } catch (error) {
      logger.warn('Error calling probationTeamsService', path, error.response, error.stack)
      throw error
    }
  }

  return {
    async getFunctionalMailbox(probationAreaCode, lduCode, teamCode) {
      const ldu = await this.getLduWithProbationTeams(probationAreaCode, lduCode)
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
      return getResource(`${apiUrl}/probation-area-codes`)
    },

    async getLduWithProbationTeams(probationAreaCode, lduCode) {
      return getResource(`${apiUrl}/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}`)
    },

    async getProbationArea(probationAreaCode) {
      return getResource(`${apiUrl}/probation-areas/${probationAreaCode}`)
    },

    async deleteLduFunctionalMailbox(probationAreaCode, localDeliveryUnitCode): Promise<void> {
      await deleteResource(
        `${apiUrl}/probation-areas/${probationAreaCode}/local-delivery-units/${localDeliveryUnitCode}/functional-mailbox`
      )
    },

    async setLduFunctionalMailbox(probationAreaCode, localDeliveryUnitCode, proposedFunctionalMailbox): Promise<void> {
      await putResource(
        `${apiUrl}/probation-areas/${probationAreaCode}/local-delivery-units/${localDeliveryUnitCode}/functional-mailbox`,
        `"${proposedFunctionalMailbox}"`
      )
    },

    async deleteProbationTeamFunctionalMailbox(probationAreaCode, localDeliveryUnitCode, teamCode): Promise<void> {
      await deleteResource(
        `${apiUrl}/probation-areas/${probationAreaCode}/local-delivery-units/${localDeliveryUnitCode}/teams/${teamCode}/functional-mailbox`
      )
    },

    async setProbationTeamFunctionalMailbox(
      probationAreaCode,
      localDeliveryUnitCode,
      teamCode,
      proposedFunctionalMailbox
    ): Promise<void> {
      await putResource(
        `${apiUrl}/probation-areas/${probationAreaCode}/local-delivery-units/${localDeliveryUnitCode}/teams/${teamCode}/functional-mailbox`,
        `"${proposedFunctionalMailbox}"`
      )
    },
  }
}
