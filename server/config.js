require('dotenv').config()

const production = process.env.NODE_ENV === 'production'
const oneDay = 24 * 60 * 60

function get(name, fallback, options = {}) {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

module.exports = {
  version: 0.1,

  enableTestUtils: get('ENABLE_TEST_UTILS', false),

  db: {
    username: get('DB_USER', 'licences'),
    password: get('DB_PASS', 'licences'),
    server: get('DB_SERVER', 'localhost'),
    database: get('DB_NAME', 'licences'),
    sslEnabled: get('DB_SSL_ENABLED', 'true'),
  },

  nomis: {
    apiUrl: get('NOMIS_API_URL', 'http://localhost:9090/elite2api'),
    authUrl: get('NOMIS_AUTH_URL', 'http://localhost:9090/elite2api'),
    authExternalUrl: get('NOMIS_AUTH_EXTERNAL_URL', get('NOMIS_AUTH_URL', 'http://localhost:8080/auth')),
    timeout: {
      response: 30000,
      deadline: 35000,
    },
    apiClientId: get('API_CLIENT_ID', 'licences'),
    apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret'),
    licencesAdminApiClientId: get('ADMIN_API_CLIENT_ID', 'licencesadmin'),
    licencesAdminApiClientSecret: get('ADMIN_API_CLIENT_SECRET', 'clientsecret'),
    globalSearchUrl: get('GLOBAL_SEARCH_URL', 'http://localhost:3002/global-search'),
  },

  https: production,
  staticResourceCacheDuration: 365 * oneDay,
  healthcheckInterval: Number(get('HEALTHCHECK_INTERVAL', 0)),

  sessionSecret: get('SESSION_SECRET', 'licences-insecure-default-session', { requireInProduction: true }),

  pdf: {
    pdfServiceHost: get('PDF_SERVICE_HOST', 'http://localhost:8081'),
    taggingCompanyTelephone: get('TAGGING_CO_PHONE', '01234 567890'),
  },

  roles: {
    admin: ['BATCHLOAD'],
    user: ['CA', 'RO', 'DM'],
  },

  domain: get('DOMAIN', 'http://localhost:3000'),

  notifyKey: get('NOTIFY_API_KEY', 'default_key'),
  tagManagerKey: get('TAG_MANAGER_KEY', null),

  pushToNomis: get('PUSH_TO_NOMIS', false),
  use2019Conditions: get('2019_CONDITIONS', false),
}
