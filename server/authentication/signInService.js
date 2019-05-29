const superagent = require('superagent')
const querystring = require('querystring')
const config = require('../config')
const { generateOauthClientToken, generateAdminOauthClientToken } = require('./oauth')
const logger = require('../../log')
const fiveMinutesBefore = require('../utils/fiveMinutesBefore')

const timeoutSpec = {
  response: config.nomis.timeout.response,
  deadline: config.nomis.timeout.deadline,
}

const signInService = () => {
  const getRefreshTokens = async (username, role, refreshToken) => {
    const oauthClientToken = generateOauthClientToken()
    const oauthRequest = { grant_type: 'refresh_token', refresh_token: refreshToken }

    return oauthTokenRequest(oauthClientToken, oauthRequest)
  }

  return {
    async getRefreshedToken(user) {
      logger.info(`Refreshing token for : ${user.username}`)

      const { token, refreshToken, expiresIn } = await getRefreshTokens(user.username, user.role, user.refreshToken)

      const refreshTime = fiveMinutesBefore(expiresIn)

      return { token, refreshToken, refreshTime }
    },

    async getClientCredentialsTokens(username) {
      const oauthAdminClientToken = generateAdminOauthClientToken()
      const oauthRequest = { grant_type: 'client_credentials', username }

      return oauthTokenRequest(oauthAdminClientToken, oauthRequest)
    },

    async getAnonymousClientCredentialsTokens() {
      const oauthAdminClientToken = generateAdminOauthClientToken()
      const oauthRequest = { grant_type: 'client_credentials' }

      return oauthTokenRequest(oauthAdminClientToken, oauthRequest)
    },
  }
}

const parseOauthTokens = oauthResult => {
  const token = oauthResult.body.access_token
  const refreshToken = oauthResult.body.refresh_token
  const expiresIn = oauthResult.body.expires_in

  return { token, refreshToken, expiresIn }
}

const getOauthToken = (oauthClientToken, requestSpec) => {
  const oauthRequest = querystring.stringify(requestSpec)

  return superagent
    .post(`${config.nomis.authUrl}/oauth/token`)
    .set('Authorization', oauthClientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(oauthRequest)
    .timeout(timeoutSpec)
}

const oauthTokenRequest = async (clientToken, oauthRequest) => {
  const oauthResult = await getOauthToken(clientToken, oauthRequest)
  logger.info(`Oauth request for grant type '${oauthRequest.grant_type}', result status: ${oauthResult.status}`)

  return parseOauthTokens(oauthResult)
}

module.exports = () => signInService()
