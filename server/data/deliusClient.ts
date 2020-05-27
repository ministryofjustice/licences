import Agent, { HttpsAgent } from 'agentkeepalive'
import superagent from 'superagent'
import { DeliusClient } from '../../types/delius'
import logger from '../../log'
import config from '../config'
import { getIn } from '../utils/functionalHelpers'
import { buildErrorLogger, buildErrorHandler } from './clientErrorHandler'

const DELIUS_API_NAME = 'Delius Community API'
const logError = buildErrorLogger(DELIUS_API_NAME)
const handleError = buildErrorHandler(DELIUS_API_NAME)

// HTTP status code 404 - Not Found
const NOT_FOUND = 404

// eslint-disable-next-line import/prefer-default-export
export const createDeliusClient = (signInService): DeliusClient => {
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

  async function get(path) {
    const token = await signInService.getAnonymousClientCredentialsTokens('delius')
    if (!token) {
      throw Error(`Failed to get token when attempting to call delius: ${path}`)
    }
    const result = await superagent
      .get(`${apiUrl}${path}`)
      .agent(keepaliveAgent)
      .set('Authorization', `Bearer ${token.token}`)
      .retry(2, (err) => {
        if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })
      .timeout(timeoutSpec)

    return result.body
  }

  async function safeGet(path) {
    try {
      return await get(path)
    } catch (error) {
      handleError(error, path)
      return undefined // unreachable
    }
  }

  async function put(path) {
    try {
      const token = await signInService.getAnonymousClientCredentialsTokens('delius')
      if (!token) {
        throw Error(`Failed to get token when attempting to call delius: ${path}`)
      }

      const result = await superagent
        .put(`${apiUrl}${path}`)
        .agent(keepaliveAgent)
        .set('Authorization', `Bearer ${token.token}`)
        .timeout(timeoutSpec)

      return result.body
    } catch (error) {
      logError(error, path, 'PUT')
      return null
    }
  }

  return {
    getStaffDetailsByStaffCode(staffCode) {
      return safeGet(`/staff/staffCode/${staffCode}`)
    },

    getStaffDetailsByUsername(username) {
      return safeGet(`/staff/username/${username}`)
    },

    getROPrisoners(deliusStaffCode) {
      return safeGet(`/staff/staffCode/${deliusStaffCode}/managedOffenders`)
    },

    getAllOffenderManagers(offenderNo) {
      return safeGet(`/offenders/nomsNumber/${offenderNo}/allOffenderManagers`)
    },

    getAllProbationAreas() {
      return safeGet(`/probationAreas?excludeEstablishments=true&active=true`)
    },

    async getAllLdusForProbationArea(probationAreaCode) {
      const path = `/probationAreas/code/${probationAreaCode}/localDeliveryUnits`
      try {
        return await get(path)
      } catch (error) {
        if (error.status === NOT_FOUND) {
          return { content: [] }
        }
        handleError(error, path)
        return undefined // unreachable
      }
    },

    async getAllTeamsForLdu(probationAreaCode, lduCode) {
      const path = `/probationAreas/code/${probationAreaCode}/localDeliveryUnits/code/${lduCode}/teams`
      try {
        const body = await get(path)
        if (body && body.content) {
          return body
        }
        return { content: [] }
      } catch (error) {
        if (error.status === NOT_FOUND) {
          return { content: [] }
        }
        handleError(error, path)
        return undefined // unreachable
      }
    },

    addResponsibleOfficerRole(username) {
      return put(`/users/${username}/roles/${config.delius.responsibleOfficerRoleId}`)
    },
  }
}
