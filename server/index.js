const { NotifyClient } = require('notifications-node-client')
const createApp = require('./app')
const logger = require('../log')
const config = require('./config')
const audit = require('./data/audit')

const licenceClient = require('./data/licenceClient')
const userClient = require('./data/userClient')
const configClient = require('./data/configClient')
const dbLockingClient = require('./data/dbLockingClient')
const nomisClientBuilder = require('./data/nomisClientBuilder')
const pdfFormatter = require('./services/utils/pdfFormatter')

const notifyClient = new NotifyClient(config.notifications.notifyKey)
const createSignInService = require('./authentication/signInService')
const createLicenceService = require('./services/licenceService')
const { createPrisonerService } = require('./services/prisonerService')
const createConditionsService = require('./services/conditionsService')
const createCaseListService = require('./services/caseListService')
const createPdfService = require('./services/pdfService')
const createFormService = require('./services/formService')
const createReportingService = require('./services/reportingService')
const createCaseListFormatter = require('./services/utils/caseListFormatter')
const createUserAdminService = require('./services/userAdminService')
const createUserService = require('./services/userService')
const createNotificationService = require('./services/notificationService')
const createRoContactDetailsService = require('./services/roContactDetailsService')
const createReminderService = require('./services/reminderService')

const createNomisPushService = require('./services/nomisPushService')
const createDeadlineService = require('./services/deadlineService')
const createJobSchedulerService = require('./services/jobSchedulerService')
const createNotificationJobs = require('./services/jobs/notificationJobs')
const createDeliusClient = require('./data/deliusClient')
const createRoService = require('./services/roService')

const signInService = createSignInService(audit)
const licenceService = createLicenceService(licenceClient)
const conditionsService = createConditionsService(config)
const deliusClient = createDeliusClient(signInService)
const roService = createRoService(deliusClient, nomisClientBuilder)
const prisonerService = createPrisonerService(nomisClientBuilder, roService)
const caseListFormatter = createCaseListFormatter(logger, licenceClient)
const caseListService = createCaseListService(nomisClientBuilder, roService, licenceClient, caseListFormatter)
const pdfService = createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter)
const formService = createFormService(pdfFormatter, conditionsService, prisonerService, configClient)
const reportingService = createReportingService(audit)
const userAdminService = createUserAdminService(nomisClientBuilder, userClient, signInService, prisonerService)
const userService = createUserService(nomisClientBuilder)
const deadlineService = createDeadlineService(licenceClient)
const roContactDetailsService = createRoContactDetailsService(userAdminService, roService)
const notificationService = createNotificationService(
  prisonerService,
  roContactDetailsService,
  configClient,
  notifyClient,
  audit,
  nomisClientBuilder,
  config
)
const reminderService = createReminderService(prisonerService, deadlineService, notificationService)
const nomisPushService = createNomisPushService(nomisClientBuilder, signInService)
const notificationJobs = createNotificationJobs(reminderService, signInService)
const jobSchedulerService = createJobSchedulerService(dbLockingClient, configClient, notificationJobs)

const app = createApp({
  signInService,
  licenceService,
  prisonerService,
  conditionsService,
  caseListService,
  pdfService,
  formService,
  reportingService,
  userAdminService,
  notificationService,
  userService,
  nomisPushService,
  deadlineService,
  configClient,
  jobSchedulerService,
  roService,
  audit,
})

module.exports = app
