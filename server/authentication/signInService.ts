import superagent from 'superagent'
import querystring from 'querystring'
import config from '../config'
import { generateAdminOauthClientToken } from './oauth'
import logger from '../../log'
import { buildErrorHandler } from '../data/clientErrorHandler'
import type TokenStore from '../data/tokenStore'

const handleError = buildErrorHandler('OAuth')

const timeoutSpec = {
  response: config.nomis.timeout.response,
  deadline: config.nomis.timeout.deadline,
}

export = class SignInService {
  constructor(private readonly tokenStore: TokenStore) {}

  async getClientCredentialsTokens(username, service = 'nomis') {
    const key = username || '%ANONYMOUS%'

    const token = await this.tokenStore.getToken(key)
    if (token) {
      return token
    }
    const oauthAdminClientToken = generateAdminOauthClientToken(service)
    const oauthRequest = { grant_type: 'client_credentials', username }

    const newToken = await oauthTokenRequest(oauthAdminClientToken, oauthRequest, service)

    await this.tokenStore.setToken(key, newToken.token, newToken.expiresIn - 60)

    return newToken.token
  }

  async getAnonymousClientCredentialsTokens(service = 'nomis'): Promise<string> {
    const token = await this.tokenStore.getToken('%ANONYMOUS%')
    if (token) {
      return token
    }
    const oauthAdminClientToken = generateAdminOauthClientToken(service)
    const oauthRequest = { grant_type: 'client_credentials' }
    const newToken = await oauthTokenRequest(oauthAdminClientToken, oauthRequest, service)

    await this.tokenStore.setToken('%ANONYMOUS%', newToken.token, newToken.expiresIn - 60)

    return newToken.token
  }
}

const parseOauthTokens = (oauthResult) => {
  const token = oauthResult.body.access_token
  const expiresIn = oauthResult.body.expires_in

  return { token, expiresIn }
}

const getOauthToken = (oauthClientToken, requestSpec, service) => {
  const oauthRequest = querystring.stringify(requestSpec)

  return superagent
    .post(`${config[service].authUrl}/oauth/token`)
    .set('Authorization', oauthClientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(oauthRequest)
    .timeout(timeoutSpec)
    .catch((error) => handleError(error, 'oauth/token', 'POST'))
}

const oauthTokenRequest = async (clientToken, oauthRequest, service) => {
  const oauthResult = await getOauthToken(clientToken, oauthRequest, service)
  logger.info(`Oauth request for grant type '${oauthRequest.grant_type}', result status: ${oauthResult.status}`)

  return parseOauthTokens(oauthResult)
}
