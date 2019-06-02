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
    port: get('DB_PORT', 5432),
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

  formsDateFormat: 'Do MMMM YYYY',
  formTemplates: {
    forms_hdc_eligible: 'Eligible',
    forms_hdc_ineligible: 'Not eligible',
    forms_hdc_unsuitable: 'Not suitable',
    forms_hdc_address_checks: 'Information about address checks',
    forms_hdc_address: 'Address form',
    forms_hdc_address_unsuitable: 'Address unsuitable',
    forms_hdc_optout: 'Opt out',
    forms_hdc_postponed: 'Postponed',
    forms_hdc_no_time: 'Not enough time',
    forms_hdc_refused: 'Refused',
    forms_hdc_approved: 'Approved',
  },

  roles: {
    admin: ['BATCHLOAD'],
    user: ['CA', 'RO', 'DM'],
  },

  domain: get('DOMAIN', 'http://localhost:3000'),
  tagManagerKey: get('TAG_MANAGER_KEY', null),

  notifications: {
    notifyKey: get('NOTIFY_API_KEY', 'dummy-key'),
    dueDateFormat: 'dddd Do MMMM',
    roNewCaseWorkingDays: 10,
    roNewCaseTodayCutOff: 15,
  },

  pushToNomis: get('PUSH_TO_NOMIS', 'no') === 'yes',
  use2019Conditions: get('NEW_CONDITIONS', 'no') === 'yes',

  jobs: {
    systemUser: get('REMINDERS_SYSTEM_USER', ''),
    autostart: get('SCHEDULED_JOBS_AUTOSTART', 'no') === 'yes',
    overlapTimeout: get('SCHEDULED_JOBS_OVERLAP', 5000),
  },
}
