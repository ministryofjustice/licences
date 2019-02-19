const querystring = require('querystring')
const config = require('../config')

module.exports = {
  generateOauthClientToken,
  generateAdminOauthClientToken,
}

function generateOauthClientToken() {
  return generate(config.nomis.apiClientId, config.nomis.apiClientSecret)
}

function generateAdminOauthClientToken() {
  return generate(config.nomis.licencesAdminApiClientId, config.nomis.licencesAdminApiClientSecret)
}

function generate(clientId, clientSecret) {
  const token = Buffer.from(`${querystring.escape(clientId)}:${querystring.escape(clientSecret)}`).toString('base64')

  return `Basic ${token}`
}
