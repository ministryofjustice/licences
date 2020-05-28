import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import logger from '../../log'
import { buildErrorHandler } from './clientErrorHandler'

interface TimeoutSpec {
  response: number
  deadline: number
}

interface AgentConfig {
  maxSockets: number
  maxFreeSockets: number
  freeSocketTimeout: number
}

interface RestClientConfig {
  timeout: TimeoutSpec
  agent: AgentConfig
}

const NOT_FOUND = 404

/**
 * Configure and return a REST api client.  Building clients like this provides some
 * consistency across the various REST clients defined within this module.
 */
export = (signInService, apiUrl: string, oauthServiceName: string, restApiName: string, config: RestClientConfig) => {
  const handleError = buildErrorHandler(restApiName)
  const keepaliveAgent = apiUrl.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)

  return {
    async getResource(path): Promise<any> {
      const token = await signInService.getAnonymousClientCredentialsTokens('probationTeams')
      if (!token) {
        throw Error(`Error calling ${restApiName}. Failed to get OAuth token, path: ${path}, verb: 'GET'`)
      }
      try {
        const result = await superagent
          .get(`${apiUrl}${path}`)
          .agent(keepaliveAgent)
          .set('Authorization', `Bearer ${token.token}`)
          .retry(2, (err, res) => {
            if (res?.status >= 300 && res?.status !== NOT_FOUND) {
              if (err) logger.warn(`Retry handler found API error with ${res?.status} ${res?.error?.message}`)
              return true
            }
            return false
          })
          .timeout(config.timeout)

        return result.body
      } catch (error) {
        if (error.status === NOT_FOUND) {
          logger.info(`Not Found (404) for: '${path}', verb: 'GET'`)
          return undefined
        }
        handleError(error, path)
        return undefined // unreachable
      }
    },

    async deleteResource(path: string): Promise<void> {
      const token = await signInService.getAnonymousClientCredentialsTokens('probationTeams')
      if (!token) {
        throw Error(`Error calling ${restApiName}. Failed to get OAuth token, path: ${path}, verb: 'DELETE'`)
      }
      try {
        await superagent
          .delete(`${apiUrl}${path}`)
          .set('Authorization', `Bearer ${token.token}`)
          .timeout(config.timeout)
      } catch (error) {
        if (error.status === 404) {
          logger.info(`Not found calling probation-teams at path: '${path}', verb: 'DELETE'`, error.stack)
          return
        }
        handleError(error, path, 'DELETE')
      }
    },

    async putResource(path: string, body: string): Promise<void> {
      const token = await signInService.getAnonymousClientCredentialsTokens('probationTeams')
      if (!token) {
        throw Error(`Error calling ${restApiName}. Failed to get OAuth token, path: ${path}, verb: 'PUT'`)
      }
      try {
        await superagent
          .put(`${apiUrl}${path}`)
          .type('application/json')
          .set('Authorization', `Bearer ${token.token}`)
          .timeout(config.timeout)
          .send(body)
      } catch (error) {
        handleError(error, path, 'PUT')
      }
    },
  }
}
