const { NotifyClient } = require('notifications-node-client')
const createApp = require('./app')
const logger = require('../log')
const config = require('./config')
const audit = require('./data/audit')

const licenceClient = require('./data/licenceClient')
const userClient = require('./data/userClient')
const configClient = require('./data/configClient')
const nomisClientBuilder = require('./data/nomisClientBuilder')
const pdfFormatter = require('./services/utils/pdfFormatter')

const notifyClient = new NotifyClient(config.notifications.notifyKey)
const createSignInService = require('./authentication/signInService')
const createLicenceService = require('./services/licenceService')
const { createPrisonerService } = require('./services/prisonerService')
const createConditionsService = require('./services/conditionsService')
const createCaseListService = require('./services/caseListService')
const createPdfService = require('./services/pdfService')
const createReportingService = require('./services/reportingService')
const createCaseListFormatter = require('./services/utils/caseListFormatter')
const createUserAdminService = require('./services/userAdminService')
const createUserService = require('./services/userService')
const createNotificationService = require('./services/notificationService')
const createNomisPushService = require('./services/nomisPushService')
const createDeadlineService = require('./services/deadlineService')
const createJobSchedulerService = require('./services/jobSchedulerService')
const createNotificationJobs = require('./services/jobs/notificationJobs')

const signInService = createSignInService(audit)
const licenceService = createLicenceService(licenceClient)
const conditionsService = createConditionsService(config)
const prisonerService = createPrisonerService(nomisClientBuilder)
const caseListFormatter = createCaseListFormatter(logger, licenceClient)
const caseListService = createCaseListService(nomisClientBuilder, licenceClient, caseListFormatter)
const pdfService = createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter)
const reportingService = createReportingService(audit)
const userAdminService = createUserAdminService(nomisClientBuilder, userClient, signInService, prisonerService)
const userService = createUserService(nomisClientBuilder)
const deadlineService = createDeadlineService(licenceClient)
const notificationService = createNotificationService(
  prisonerService,
  userAdminService,
  deadlineService,
  configClient,
  notifyClient,
  audit
)
const nomisPushService = createNomisPushService(nomisClientBuilder, signInService)
const notificationJobs = createNotificationJobs(notificationService, signInService)
const jobSchedulerService = createJobSchedulerService(notificationJobs)

const app = createApp({
  signInService,
  licenceService,
  prisonerService,
  conditionsService,
  caseListService,
  pdfService,
  reportingService,
  userAdminService,
  notificationService,
  userService,
  nomisPushService,
  deadlineService,
  configClient,
  jobSchedulerService,
  audit,
})

module.exports = app
