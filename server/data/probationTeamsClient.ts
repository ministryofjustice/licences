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
/**
 * @typedef {import("../../types/probationTeams").ProbationTeamsClient} ProbationTeamsClient
 */

/**
 * @return { ProbationTeamsClient }
 */
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

  async function deleteResource(token: string, path: string) {
    if (!token) {
      throw Error(`No token supplied when attempting to DELETE probationTeamsService: ${path}`)
    }

    try {
      logger.debug(`DELETE ${path}`)
      const result = await superagent.delete(path).set('Authorization', `Bearer ${token}`).timeout(timeoutSpec)
      logger.debug(`DELETE ${path} -> ${result.status}`)
    } catch (error) {
      if (error.status === 404) {
        logger.debug('Returned 404', path, error.response, error.stack)
      }
      logger.warn('Error calling probationTeamsService', path, error.response, error.stack)
      throw error
    }
  }

  async function putResource(token: string, path: string, body: string) {
    if (!token) {
      throw Error(`No token supplied when attempting to PUT probationTeamsService: ${path}`)
    }

    try {
      logger.debug(`PUT ${path}`)

      const result = await superagent
        .put(path)
        .type('json')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .timeout(timeoutSpec)

      logger.debug(`PUT ${path} -> ${result.status}`)
    } catch (error) {
      logger.warn('Error calling probationTeamsService', path, error.response, error.stack)
      throw error
    }
  }

  return {
    async getFunctionalMailbox(probationAreaCode, lduCode, teamCode) {
      const ldu = await getResource(`${apiUrl}/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}`)
      const teamAddress = R.path(['probationTeams', teamCode, 'functionalMailbox'], ldu)
      const functionalMailbox = teamAddress || (ldu && ldu.functionalMailbox)
      if (!functionalMailbox) {
        logger.info(
          `Could not find functional mailbox for the probation area code ${probationAreaCode} having an ldu code: ${lduCode} or team code: ${teamCode}`
        )
      }
      return functionalMailbox
    },

    async getProbationArea(probationAreaCode) {
      return getResource(`${apiUrl}/probation-areas/${probationAreaCode}`)
    },

    async deleteLduFunctionalMailbox(token, probationAreaCode, localDeliveryUnitCode): Promise<void> {
      await deleteResource(
        token,
        `${apiUrl}/probation-areas/${probationAreaCode}/local-delivery-units/${localDeliveryUnitCode}/functional-mailbox`
      )
    },

    async deleteProbationTeamFunctionalMailbox(
      token,
      probationAreaCode,
      localDeliveryUnitCode,
      teamCode
    ): Promise<void> {
      await deleteResource(
        token,
        `${apiUrl}/probation-areas/${probationAreaCode}/local-delivery-units/${localDeliveryUnitCode}/teams/${teamCode}/functional-mailbox`
      )
    },

    async setLduFunctionalMailbox(
      token,
      probationAreaCode,
      localDeliveryUnitCode,
      proposedFunctionalMailbox
    ): Promise<void> {
      await putResource(
        token,
        `${apiUrl}/probation-areas/${probationAreaCode}/local-delivery-units/${localDeliveryUnitCode}/functional-mailbox`,
        `"${proposedFunctionalMailbox}"`
      )
    },

    async setProbationTeamFunctionalMailbox(
      token,
      probationAreaCode,
      localDeliveryUnitCode,
      teamCode,
      proposedFunctionalMailbox
    ): Promise<void> {
      await putResource(
        token,
        `${apiUrl}/probation-areas/${probationAreaCode}/local-delivery-units/${localDeliveryUnitCode}/teams/${teamCode}/functional-mailbox`,
        `"${proposedFunctionalMailbox}"`
      )
    },
  }
}
