/**
 * @typedef {import("../../types/delius").DeliusClient} DeliusClient
 */
/** @type {any} */
const Agent = require('agentkeepalive')
const { HttpsAgent } = require('agentkeepalive')
const superagent = require('superagent')
const logger = require('../../log')
const config = require('../config')

/**
 * @return { DeliusClient }
 */
module.exports = signInService => {
  const timeoutSpec = {
    response: config.delius.timeout.response,
    deadline: config.delius.timeout.deadline,
  }

  const agentOptions = {
    maxSockets: config.nomis.agent.maxSockets,
    maxFreeSockets: config.nomis.agent.maxFreeSockets,
    freeSocketTimeout: config.nomis.agent.freeSocketTimeout,
  }

  const apiUrl = `${config.delius.apiUrl}${config.delius.apiPrefix}`
  const keepaliveAgent = apiUrl.startsWith('https') ? new HttpsAgent(agentOptions) : new Agent(agentOptions)

  return {
    getStaffDetailsByStaffCode(staffCode) {
      return get(`${apiUrl}/staff/staffCode/${staffCode}`)
    },

    getStaffDetailsByUsername(username) {
      return get(`${apiUrl}/staff/username/${username}`)
    },

    getROPrisoners(deliusStaffCode) {
      return get(`${apiUrl}/staff/staffCode/${deliusStaffCode}/managedOffenders`)
    },

    getAllOffenderManagers(offenderNo) {
      return get(`${apiUrl}/offenders/nomsNumber/${offenderNo}/allOffenderManagers`)
    },

    getAllProbationAreas() {
      return get(`${apiUrl}/probationAreas`)
    },

    getAllLdusForProbationArea(probationAreaCode) {
      return get(`${apiUrl}/probationAreas/code/${probationAreaCode}/localDeliveryUnits`)
    },
  }

  async function get(path) {
    const token = await signInService.getAnonymousClientCredentialsTokens('delius')
    if (!token) {
      throw Error(`Failed to get token when attempting to call delius: ${path}`)
    }

    try {
      logger.debug(`GET ${path}`)
      const result = await superagent
        .get(path)
        .agent(keepaliveAgent)
        .set('Authorization', `Bearer ${token.token}`)
        .retry(2, err => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(timeoutSpec)
      logger.debug(`GET ${path} -> ${result.status}`)

      return result.body
    } catch (error) {
      const message = error && error.response && error.response.text
      logger.error(`Error calling delius: ${path}, message: '${message}'`, error.stack)
      throw error
    }
  }
}
