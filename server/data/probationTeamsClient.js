const superagent = require('superagent')
const R = require('ramda')
const logger = require('../../log')
const config = require('../config')

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
module.exports = signInService => {
  return {
    async getFunctionalMailbox(probationAreaCode, lduCode, teamCode) {
      const ldu = await get(`${apiUrl}/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}`)
      const teamAddress = R.path(['probationTeams', teamCode, 'functionalMailbox'], ldu)
      return teamAddress || (ldu && ldu.functionalMailbox)
    },
  }

  async function get(path) {
    const token = await signInService.getAnonymousClientCredentialsTokens('probationTeams')
    if (!token) {
      throw Error(`Failed to get token when attempting to call probationTeamsService: ${path}`)
    }

    try {
      logger.debug(`GET ${path}`)
      const result = await superagent
        .get(path)
        .set('Authorization', `Bearer ${token.token}`)
        .timeout(timeoutSpec)
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
}
