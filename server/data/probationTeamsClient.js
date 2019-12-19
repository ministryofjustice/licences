const superagent = require('superagent')
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
    getFunctionalMailbox(lduCode) {
      return get(`${apiUrl}/local-delivery-units/${lduCode}/functional-mailbox`)
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
