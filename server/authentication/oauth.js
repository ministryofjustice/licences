const config = require('../config').default

const generate = (clientId, clientSecret) => {
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  return `Basic ${token}`
}

const generateOauthClientToken = () => generate(config.apis.auth.apiClientId, config.apis.auth.apiClientSecret)

const generateAdminOauthClientToken = () =>
  generate(config.apis.auth.admin.apiClientId, config.apis.auth.admin.apiClientSecret)

module.exports = {
  generateOauthClientToken,
  generateAdminOauthClientToken,
}
