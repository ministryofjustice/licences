import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import logger from '../../log'
import { buildErrorHandler } from './clientErrorHandler'
import SignInService from '../authentication/signInService'

interface TimeoutSpec {
  response: number
  deadline: number
}

interface AgentConfig {
  maxSockets: number
  maxFreeSockets: number
  freeSocketTimeout: number
}

export interface RestClientConfig {
  timeout: TimeoutSpec
  agent: AgentConfig
}

const NOT_FOUND = 404

export interface TokenSource {
  (): Promise<string>
}

export const constantTokenSource =
  (token): TokenSource =>
  async () => {
    if (!token) {
      throw Error('Unauthorised access')
    }
    return token
  }

export const clientCredentialsTokenSource =
  (signInService: SignInService, oauthServiceName: string): TokenSource =>
  async () => {
    const token = await signInService.getAnonymousClientCredentialsTokens(oauthServiceName)
    if (!token) {
      throw Error(`Error obtaining OAuth token`)
    }
    return token
  }

/**
 * Configure and return a REST api client.  This is used by the REST API facades within this module.
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
            if (res) {
              if (res.status >= 500) {
                logger.warn(
                  `Error calling ${restApiName}, path '${path}', verb: 'GET', status: '${res.status}', message: '${res.error?.message}'. Retrying...`
                )
                return true
              }
              // Never retry client errors
              return false
            }
            if (err) {
              logger.warn(
                `Error calling ${restApiName}, path '${path}', verb: 'GET', message: '${err.message}'. Retrying...`
              )
            }
            // Not an obvious client error, possibly recoverable, so retry.
            return true
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
          logger.info(`Not found calling ${restApiName} at path: '${path}', verb: 'DELETE'`)
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
