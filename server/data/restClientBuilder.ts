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
const UNAUTHORIZED = 401

interface TokenSource {
  (): Promise<string>
}

export const constantTokenSource = (token): TokenSource => async () => {
  if (!token) {
    throw Error('Unauthorised access')
  }
  return token
}

export const dynamicTokenSource = (signInService, oauthServiceName: string): TokenSource => async () => {
  const token = await signInService.getAnonymousClientCredentialsTokens(oauthServiceName)
  if (!token?.token) {
    throw Error(`Error obtaining OAuth token`)
  }
  return token.token
}

/**
 * Configure and return a REST api client.  Building clients like this provides
 * consistency across the various REST clients defined within this module.
 */
export const buildRestClient = (
  tokenSource: TokenSource,
  apiUrl: string,
  restApiName: string,
  config: RestClientConfig
) => {
  const handleError = buildErrorHandler(restApiName)
  const keepaliveAgent = apiUrl.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)

  return {
    async getResource(path: string, headers = {}, query = {}): Promise<any> {
      const token = await tokenSource()
      try {
        const result = await superagent
          .get(`${apiUrl}${path}`)
          .query(query)
          .agent(keepaliveAgent)
          .set('Authorization', `Bearer ${token}`)
          .set(headers)
          .retry(2, (err, res) => {
            if (res?.status >= 300 && res?.status !== NOT_FOUND && res?.status !== UNAUTHORIZED) {
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
      const token = await tokenSource()
      try {
        await superagent.delete(`${apiUrl}${path}`).set('Authorization', `Bearer ${token}`).timeout(config.timeout)
      } catch (error) {
        if (error.status === 404) {
          logger.info(`Not found calling probation-teams at path: '${path}', verb: 'DELETE'`, error.stack)
          return
        }
        handleError(error, path, 'DELETE')
      }
    },

    async putResource(path: string, body: any): Promise<void> {
      const token = await tokenSource()
      try {
        await superagent
          .put(`${apiUrl}${path}`)
          .type('application/json')
          .set('Authorization', `Bearer ${token}`)
          .timeout(config.timeout)
          .send(body)
      } catch (error) {
        handleError(error, path, 'PUT')
      }
    },

    async postResource(path: string, body: any, headers = {}): Promise<any> {
      const token = await tokenSource()
      try {
        const response = await superagent
          .post(`${apiUrl}${path}`)
          .agent(keepaliveAgent)
          .send(body)
          .set('Authorization', `Bearer ${token}`)
          .set(headers)
          .timeout(config.timeout)
        return response.body
      } catch (error) {
        handleError(error, path, 'POST')
        return undefined // unreachable
      }
    },
  }
}
