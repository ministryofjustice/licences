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
const activeLduClient = require('./data/activeLduClient')
const warningClient = require('./data/warningClient')

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
const createNotificationSender = require('./services/notifications/notificationSender')
const createRoNotificationSender = require('./services/notifications/roNotificationSender')
const createCaAndDmNotificationSender = require('./services/notifications/caAndDmNotificationSender')
const createNotificationService = require('./services/notifications/notificationService')
const createRoNotificationHandler = require('./services/notifications/roNotificationHandler')

const createRoContactDetailsService = require('./services/roContactDetailsService')
const createReminderService = require('./services/reminderService')

const createNomisPushService = require('./services/nomisPushService')
const createDeadlineService = require('./services/deadlineService')
const createJobSchedulerService = require('./services/jobSchedulerService')
const createNotificationJobs = require('./services/jobs/notificationJobs')
const createDeliusClient = require('./data/deliusClient')
const createProbationTeamsClient = require('./data/probationTeamsClient')
const createRoService = require('./services/roService')
const createCaService = require('./services/caService')
const createLduService = require('./services/lduService')
const createLicenceSearchService = require('./services/licenceSearchService')

const signInService = createSignInService()
const licenceService = createLicenceService(licenceClient)
const conditionsService = createConditionsService(config)
const deliusClient = createDeliusClient(signInService)
const probationTeamsClient = createProbationTeamsClient(signInService)

const roService = createRoService(deliusClient, nomisClientBuilder)
const caService = createCaService(roService, activeLduClient)
const prisonerService = createPrisonerService(nomisClientBuilder, roService)
const caseListFormatter = createCaseListFormatter(logger, licenceClient)
const caseListService = createCaseListService(nomisClientBuilder, roService, licenceClient, caseListFormatter)
const pdfService = createPdfService(logger, licenceService, conditionsService, prisonerService, pdfFormatter)
const formService = createFormService(pdfFormatter, conditionsService, prisonerService, configClient)
const reportingService = createReportingService(audit)
const userAdminService = createUserAdminService(nomisClientBuilder, userClient, probationTeamsClient)
const userService = createUserService(nomisClientBuilder)
const deadlineService = createDeadlineService(licenceClient)
const roContactDetailsService = createRoContactDetailsService(userAdminService, roService, probationTeamsClient)

const notificationSender = createNotificationSender(notifyClient, audit, config)
const roNotificationSender = createRoNotificationSender(notificationSender, config)
const caAndDmNotificationSender = createCaAndDmNotificationSender(
  prisonerService,
  roContactDetailsService,
  configClient,
  notificationSender,
  nomisClientBuilder,
  config
)

const roNotificationHandler = createRoNotificationHandler(
  roNotificationSender,
  audit,
  licenceService,
  prisonerService,
  roContactDetailsService,
  warningClient,
  deliusClient
)

const notificationService = createNotificationService(
  caAndDmNotificationSender,
  audit,
  licenceService,
  prisonerService,
  roNotificationHandler
)

const reminderService = createReminderService(
  roContactDetailsService,
  prisonerService,
  deadlineService,
  roNotificationSender
)
const nomisPushService = createNomisPushService(nomisClientBuilder, signInService)
const notificationJobs = createNotificationJobs(reminderService, signInService)
const jobSchedulerService = createJobSchedulerService(dbLockingClient, configClient, notificationJobs)
const lduService = createLduService(deliusClient, activeLduClient)
const licenceSearchService = createLicenceSearchService(licenceClient, signInService, nomisClientBuilder)

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
  configClient,
  jobSchedulerService,
  licenceSearchService,
  roService,
  audit,
  caService,
  warningClient,
  lduService,
  roNotificationHandler,
})

module.exports = app
