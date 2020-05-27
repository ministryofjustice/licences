const superagent = require('superagent')
const querystring = require('querystring')
const R = require('ramda')
const config = require('../config')
const { generateOauthClientToken, generateAdminOauthClientToken } = require('./oauth')
const logger = require('../../log')
const fiveMinutesBefore = require('../utils/fiveMinutesBefore')
const handleError = require('../data/clientErrorHandler').buildErrorHandler('OAuth')

const timeoutSpec = {
  response: config.nomis.timeout.response,
  deadline: config.nomis.timeout.deadline,
}

const signInService = () => {
  const getRefreshTokens = async (refreshToken, service) => {
    const oauthClientToken = generateOauthClientToken()
    const oauthRequest = { grant_type: 'refresh_token', refresh_token: refreshToken }

    return oauthTokenRequest(oauthClientToken, oauthRequest, service)
  }

  return {
    async getRefreshedToken(user, service = 'nomis') {
      logger.info(`Refreshing token for : ${user.username}`)

      const { token, refreshToken, expiresIn } = await getRefreshTokens(user.refreshToken, service)

      const refreshTime = fiveMinutesBefore(expiresIn)

      return { token, refreshToken, refreshTime }
    },

    async getClientCredentialsTokens(username, service = 'nomis') {
      const oauthAdminClientToken = generateAdminOauthClientToken(service)
      const oauthRequest = { grant_type: 'client_credentials', username }

      return oauthTokenRequest(oauthAdminClientToken, oauthRequest, service)
    },

    async getAnonymousClientCredentialsTokens(service = 'nomis') {
      const oauthAdminClientToken = generateAdminOauthClientToken(service)
      const oauthRequest = { grant_type: 'client_credentials' }
      return oauthTokenRequest(oauthAdminClientToken, oauthRequest, service)
    },
  }
}

const parseOauthTokens = (oauthResult) => {
  const token = oauthResult.body.access_token
  const refreshToken = oauthResult.body.refresh_token
  const expiresIn = oauthResult.body.expires_in

  return { token, refreshToken, expiresIn }
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

module.exports = () => signInService()
