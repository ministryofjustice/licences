/**
 * @typedef {import("../../types/delius").DeliusClient} DeliusClient
 */
/** @type {any} */
const Agent = require('agentkeepalive')
const { HttpsAgent } = require('agentkeepalive')
const superagent = require('superagent')
const logger = require('../../log')
const config = require('../config')

const { getIn } = require('../utils/functionalHelpers')

/**
 * @return { DeliusClient }
 */
module.exports = (signInService) => {
  const timeoutSpec = {
    response: config.delius.timeout.response,
    deadline: config.delius.timeout.deadline,
  }

  const agentOptions = {
    maxSockets: config.delius.agent.maxSockets,
    maxFreeSockets: config.delius.agent.maxFreeSockets,
    freeSocketTimeout: config.delius.agent.freeSocketTimeout,
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
      return get(`${apiUrl}/probationAreas?excludeEstablishments=true&active=true`)
    },

    getAllLdusForProbationArea(probationAreaCode) {
      return get(`${apiUrl}/probationAreas/code/${probationAreaCode}/localDeliveryUnits`)
    },

    addResponsibleOfficerRole(username) {
      return put(`${apiUrl}/users/${username}/roles/${config.delius.responsibleOfficerRoleId}`)
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
        .retry(2, (err) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(timeoutSpec)
      logger.debug(`GET ${path} -> ${result.status}`)

      return result.body
    } catch (error) {
      logger.warn(
        `Error calling delius, path: '${path}', verb: 'GET', response: '${getIn(error, ['response', 'text'])}'`,
        error.stack
      )
      throw error
    }
  }

  async function put(path) {
    const token = await signInService.getAnonymousClientCredentialsTokens('delius')
    if (!token) {
      throw Error(`Failed to get token when attempting to call delius: ${path}`)
    }

    try {
      logger.debug(`PUT ${path}`)
      const result = await superagent
        .put(path)
        .agent(keepaliveAgent)
        .set('Authorization', `Bearer ${token.token}`)
        .timeout(timeoutSpec)
      logger.debug(`PUT ${path} -> ${result.status}`)

      return result.body
    } catch (error) {
      logger.warn(
        `Error calling delius, path: '${path}', verb: 'PUT', response: '${getIn(error, ['response', 'text'])}'`,
        error.stack
      )
    }
  }
}
