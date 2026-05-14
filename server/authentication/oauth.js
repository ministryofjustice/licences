const config = require('../config').default

const generate = (clientId, clientSecret) => {
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  return `Basic ${token}`
}

const generateOauthClientToken = () => generate(config.apis.nomis.apiClientId, config.apis.nomis.apiClientSecret)

const generateAdminOauthClientToken = (service) =>
  generate(config.apis[service].admin.apiClientId, config.apis[service].admin.apiClientSecret)

module.exports = {
  generateOauthClientToken,
  generateAdminOauthClientToken,
}
