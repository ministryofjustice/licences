const production = process.env.NODE_ENV === 'production'
const oneDay = 24 * 60 * 60

function get(name: string, fallback: any, options: { requireInProduction?: boolean } = {}) {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const today = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function nationalRoleOut(roleOutDateString: string) {
  let roleOutDate: Date = null
  if (roleOutDateString) {
    const parsedDate = new Date(roleOutDateString)
    if (!Number.isNaN(parsedDate.getTime())) {
      parsedDate.setHours(0, 0, 0, 0)
      roleOutDate = parsedDate
    }
  }
  return {
    roleOutDate,
    isActive() {
      return (
        this.roleOutDate !== null &&
        this.roleOutDate.getTime() <= today().getTime()
      )
    }
  }
}

export default {
  version: 0.1,

  production,

  enableTestUtils: get('ENABLE_TEST_UTILS', false),
  buildNumber: get('BUILD_NUMBER', '1_0_0', { requireInProduction: true }),
  productId: get('PRODUCT_ID', 'UNASSIGNED', { requireInProduction: true }),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', { requireInProduction: true }),
  branchName: get('GIT_BRANCH', 'xxxxxxxxxxxxxxxxxxx', { requireInProduction: true }),
  db: {
    username: get('DB_USER', 'licences'),
    password: get('DB_PASS', 'licences'),
    server: get('DB_SERVER', 'localhost'),
    database: get('DB_NAME', 'licences'),
    sslEnabled: get('DB_SSL_ENABLED', 'false'),
    port: get('DB_PORT', 5432)
  },

  redis: {
    host: get('REDIS_HOST', 'localhost'),
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false')
  },
  apis: {
    auth: {
      url: get('NOMIS_AUTH_URL', 'http://localhost:9090/auth'),
      healthPath: '/health/ping',
      authExternalUrl: get('NOMIS_AUTH_EXTERNAL_URL', get('NOMIS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: 30000,
        deadline: 35000
      },
      agent: {
        maxSockets: 100,
        maxFreeSockets: 10,
        freeSocketTimeout: 30000
      },
      apiClientId: get('API_CLIENT_ID', 'licences'),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret'),
      admin: {
        apiClientId: get('ADMIN_API_CLIENT_ID', 'licencesadmin'),
        apiClientSecret: get('ADMIN_API_CLIENT_SECRET', 'clientsecret')
      }
    },
    nomis: {
      url: get('NOMIS_API_URL', 'http://localhost:8080/prisonApi'),
      healthPath: '/health/ping',
      timeout: {
        response: 30000,
        deadline: 35000
      },
      agent: {
        maxSockets: 100,
        maxFreeSockets: 10,
        freeSocketTimeout: 30000
      },
    },
    delius: {
      url: get('DELIUS_API_URL', 'http://localhost:8080/delius'),
      healthPath: '/health/ping',
      timeout: {
        response: 30000,
        deadline: 35000
      },
      agent: {
        maxSockets: 100,
        maxFreeSockets: 10,
        freeSocketTimeout: 30000
      },
      // this refers to the 'HDC Digital Update' RBAC which is mapped to LICENCE_RO and GLOBAL_SEARCH in the auth server
      responsibleOfficerRoleId: get('DELIUS_RO_ROLE_ID', 'LHDCBT002'),
      // this refers to the 'HDC Digital Update' RBAC which is mapped to LICENCE_RO, GLOBAL_SEARCH and LICENCE_VARY in the auth server
      responsibleOfficerVaryRoleId: get('DELIUS_RO_VARY_ROLE_ID', 'LHDCBT003')
    },

    hdc: {
      url: get('HDC_API_URL', 'http://localhost:8089'),
      healthPath: '/health/ping',
      timeout: {
        response: 30000,
        deadline: 35000
      },
      agent: {
        maxSockets: 100,
        maxFreeSockets: 10,
        freeSocketTimeout: 30000
      }
    },

    prisonerSearchApi: {
      url: get('PRISONER_SEARCH_API_URL', 'http://localhost:8083'),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('PRISONER_SEARCH_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('PRISONER_SEARCH_API_TIMEOUT_DEADLINE', 30000))
      },
      agent: {
        maxSockets: 100,
        maxFreeSockets: 10,
        freeSocketTimeout: 30000
      }
    },

    probationSearchApi: {
      url: get('PROBATION_SEARCH_API_URL', 'http://localhost:8084'),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('PROBATION_SEARCH_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('PROBATION_SEARCH_API_TIMEOUT_DEADLINE', 30000))
      },
      agent: {
        maxSockets: 100,
        maxFreeSockets: 10,
        freeSocketTimeout: 30000
      }
    },

    manageUsersApi: {
      url: get('MANAGE_USERS_API_URL', 'http://localhost:8080/manageUsersApi'),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('MANAGE_USERS_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('MANAGE_USERS_API_TIMEOUT_DEADLINE', 30000))
      },
      agent: {
        maxSockets: 100,
        maxFreeSockets: 10,
        freeSocketTimeout: 30000
      }
    },

    probationTeams: {
      url: get('PROBATION_TEAMS_API_URL', 'http://localhost:8080/probationteams'),
      healthPath: '/health/ping',
      timeout: {
        response: 30000,
        deadline: 35000
      },
      agent: {
        maxSockets: 100,
        maxFreeSockets: 10,
        freeSocketTimeout: 30000
      },
    },

    gotenberg: {
      url: get('GOTENBERG_API_URL', 'http://localhost:3001'),
      healthPath: '/health',
      /*
     The HTML documents sent to Gotenberg for PDF conversion contain links to css files served by the HDC service.
     HDC_URL should be the base url inserted into the CSS links so that Gotenberg can fetch these CSS files.

     If you're running Gotenberg in a docker container on a mac, and running the licences service on the host (the mac)
     then the Gotenberg container will find the licences service at host.docker.internal.  This is a standard Docker feature.

     You can check this using curl or ping from within a handy container:

     docker run --rm -it alpine sh
     ping host.docker.internal
     curl http://host.docker.internal:3000

     */
      hdcUrl: get('HDC_URL', 'http://host.docker.internal:3000')
    },

    tokenVerification: {
      url: get('TOKENVERIFICATION_API_URL', 'http://localhost:8100', { requireInProduction: true }),
      healthPath: '/health/ping',
      timeout: {
        response: get('TOKENVERIFICATION_TIMEOUT_RESPONSE', 10000),
        deadline: get('TOKENVERIFICATION_TIMEOUT_DEADLINE', 10000)
      },
      agent: {
        maxSockets: 100,
        maxFreeSockets: 10,
        freeSocketTimeout: 30000
      },
      enabled: get('TOKENVERIFICATION_API_ENABLED', 'true') === 'true'
    }
  },

  https: production,
  staticResourceCacheDuration: 365 * oneDay,

  session: {
    secret: get('SESSION_SECRET', 'licences-insecure-default-session', { requireInProduction: true }),
    expiryMinutes: get('WEB_SESSION_TIMEOUT_IN_MINUTES', '120')
  },

  pdf: {
    licences: {
      taggingCompanyTelephone: get('TAGGING_CO_PHONE', '0800 137 291'),
      pdfOptions: {
        marginTop: '0.8',
        marginBottom: '0.7',
        marginLeft: '0.55',
        marginRight: '0.35'
      }
    },
    forms: {
      formsDateFormat: 'Do MMMM YYYY',
      formsFileDateFormat: 'YYYYMMDD',
      formTemplates: {
        eligible: 'Eligible',
        ineligible: 'Not eligible',
        unsuitable: 'Not suitable',
        address_checks: 'Information about address checks',
        address: 'Address form',
        address_unsuitable: 'Address unsuitable',
        optout: 'Opt out',
        postponed: 'Postponed',
        no_time: 'Not enough time',
        refused: 'Refused',
        approved: 'Approved',
        licence_variation: 'Licence variation'
      },
      eligibilityAndSuitabilityFormTemplates: {
        eligible: 'Eligible',
        ineligible: 'Not eligible',
        unsuitable: 'Not suitable'
      },
      addressChecksFormTemplates: {
        address_checks: 'Information about address checks',
        address: 'Address form',
        address_unsuitable: 'Address unsuitable'
      },
      applicationOutcomeFormTemplates: {
        optout: 'Opt out',
        postponed: 'Postponed',
        no_time: 'Not enough time',
        refused: 'Refused',
        approved: 'Approved'
      },
      licenceVariationFormTemplates: {
        licence_variation: 'Licence variation'
      },
      pdfOptions: {
        marginTop: '0.8',
        marginBottom: '0.7',
        marginLeft: '0.55',
        marginRight: '0.35'
      }
    }
  },

  domain: get('DOMAIN', 'http://localhost:3000'),
  port: get('PORT', 3000),
  tagManagerKey: get('TAG_MANAGER_KEY', null),

  notifications: {
    notifyKey: get('NOTIFY_API_KEY', 'dummy-key'),
    dueDateFormat: 'dddd Do MMMM',
    roNewCaseWorkingDays: 10,
    roNewCaseTodayCutOff: 15,
    activeNotificationTypes: get(
      'NOTIFY_ACTIVE_TEMPLATES',
      'CA_RETURN,CA_DECISION,RO_NEW,RO_TWO_DAYS,RO_DUE,RO_OVERDUE,DM_NEW,DM_TO_CA_RETURN'
    ).split(',')
  },

  pushToNomis: get('PUSH_TO_NOMIS', 'no') === 'yes',

  jobs: {
    systemUser: get('REMINDERS_SYSTEM_USER', ''),
    autostart: get('SCHEDULED_JOBS_AUTOSTART', 'no') === 'yes',
    overlapTimeout: get('SCHEDULED_JOBS_OVERLAP', 5000)
  },

  links: {
    exitUrl: get('EXIT_LOCATION_URL', '/', { requireInProduction: true }),
    globalSearchUrl: get('GLOBAL_SEARCH_URL', 'http://localhost:3002/global-search'),
    feedbackAndSupportUrl: get(
      'FEEDBACK_SUPPORT_URL',
      'https://support-dev.hmpps.service.justice.gov.uk/feedback-and-support'
    ),
    electronicMonitoringOrderUrl: get(
      'ELECTRONIC_MONITORING_ORDER_URL',
      'https://hmpps-electronic-monitoring-create-an-order.hmpps.service.justice.gov.uk/'
    )
  },

  riskManagementVersion: get('LICENCE_RISK_MANAGEMENT_VERSION', '3'),
  curfewAddressReviewVersion: get('CURFEW_ADDRESS_REVIEW_VERSION', '2'),
  postponeVersion: get('LICENCE_POSTPONE_VERSION', '2'),
  comNotAllocatedBlockEnabled: get('COM_NOT_ALLOCATED_BLOCK_ENABLED', false) === 'true',
  caReportsLinkEnabled: get('CA_REPORTS_LINK_ENABLED', false) === 'true',
  hdcInCvlEarlyAdopter: {
      enabled: get('HDC_IN_CVL_EARLY_ADOPTER_ENABLED', false) === 'true',
      providerCodes: get('HDC_IN_CVL_EARLY_ADOPTER_PROVIDER_CODES', '').split(',')
  },
  hdcInCvlNationalRoleOut: nationalRoleOut(
    get('HDC_IN_CVL_NATIONAL_ROLE_OUT_DATE', '')
  ),
}

