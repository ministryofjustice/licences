const querystring = require('querystring')
const config = require('../config')

const generate = (clientId, clientSecret) => {
  const token = Buffer.from(`${querystring.escape(clientId)}:${querystring.escape(clientSecret)}`).toString('base64')

  return `Basic ${token}`
}

const generateOauthClientToken = () => generate(config.nomis.apiClientId, config.nomis.apiClientSecret)

const generateAdminOauthClientToken = service =>
  generate(config[service].admin.apiClientId, config[service].admin.apiClientSecret)

module.exports = {
  generateOauthClientToken,
  generateAdminOauthClientToken,
}
