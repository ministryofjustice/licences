const { appInsights } = require('./utils/azureAppInsights')
// eslint-disable-next-line import/order
const { NotifyClient } = require('notifications-node-client')
const createApp = require('./app')
const logger = require('../log')
const config = require('./config')
const audit = require('./data/audit')

const { licenceClient } = require('./data/licenceClient')
const { userClient } = require('./data/userClient')
const configClient = require('./data/configClient')
const dbLockingClient = require('./data/dbLockingClient')
const nomisClientBuilder = require('./data/nomisClientBuilder')
const pdfFormatter = require('./services/utils/pdfFormatter')
const activeLduClient = require('./data/activeLduClient')
const warningClient = require('./data/warningClient')

const notifyClient = new NotifyClient(config.notifications.notifyKey)
const SignInService = require('./authentication/signInService')
const { createLicenceService } = require('./services/licenceService')
const { createPrisonerService } = require('./services/prisonerService')
const ConditionServiceFactory = require('./services/conditionsService').ConditionsServiceFactory
const createCaseListService = require('./services/caseListService')
const MigrationService = require('./services/migrationService').default
const PdfService = require('./services/pdfService').default
const FormService = require('./services/formService').default
const createReportingService = require('./services/reportingService')
const createCaseListFormatter = require('./services/utils/caseListFormatter')
const UserAdminService = require('./services/userAdminService')
const createUserService = require('./services/userService')
const createNotificationSender = require('./services/notifications/notificationSender')
const createRoNotificationSender = require('./services/notifications/roNotificationSender')
const createCaAndDmNotificationSender = require('./services/notifications/caAndDmNotificationSender')
const createNotificationService = require('./services/notifications/notificationService')
const createRoNotificationHandler = require('./services/notifications/roNotificationHandler')
const EventPublisher = require('./services/notifications/eventPublisher')

const { RoContactDetailsService } = require('./services/roContactDetailsService')
const createReminderService = require('./services/reminderService')

const createNomisPushService = require('./services/nomisPushService')
const createDeadlineService = require('./services/deadlineService')
const createJobSchedulerService = require('./services/jobSchedulerService')
const createNotificationJobs = require('./services/jobs/notificationJobs')
const { buildRestClient, clientCredentialsTokenSource } = require('./data/restClientBuilder')
const { DeliusClient } = require('./data/deliusClient')
const { ProbationTeamsClient } = require('./data/probationTeamsClient')
const { RoService } = require('./services/roService')
const createCaService = require('./services/caService')
const createLduService = require('./services/lduService')
const { FunctionalMailboxService } = require('./services/functionalMailboxService')
const createLicenceSearchService = require('./services/licenceSearchService')
const ReportsService = require('./services/reportsService').default
const tokenVerifierFactory = require('./authentication/tokenverifier/tokenVerifierFactory')
const { default: TokenStore } = require('./data/tokenStore')
const { createRedisClient } = require('./data/redisClient')
const prisonerSearchApi = require('./data/prisonerSearchApi')
const manageUsersApi = require('./data/manageUsersApi')
const probationSearchApi = require('./data/probationSearchApi')

const signInService = new SignInService(new TokenStore(createRedisClient()))
const licenceService = createLicenceService(licenceClient)
const conditionsServiceFactory = new ConditionServiceFactory()

const deliusClient = new DeliusClient(
  buildRestClient(
    clientCredentialsTokenSource(signInService, 'delius'),
    config.delius.apiUrl,
    'Delius Integration API',
    { timeout: config.delius.timeout, agent: config.delius.agent }
  )
)

const probationTeamsClient = new ProbationTeamsClient(
  buildRestClient(
    clientCredentialsTokenSource(signInService, 'probationTeams'),
    config.probationTeams.apiUrl,
    'probation-teams',
    { timeout: config.probationTeams.timeout, agent: config.probationTeams.agent }
  )
)

const roService = new RoService(deliusClient, nomisClientBuilder)
const caService = createCaService(roService, activeLduClient)
const prisonerService = createPrisonerService(nomisClientBuilder, roService, signInService)
const caseListFormatter = createCaseListFormatter(licenceClient)
const caseListService = createCaseListService(nomisClientBuilder, roService, licenceClient, caseListFormatter)
const pdfService = new PdfService(
  logger,
  licenceService,
  conditionsServiceFactory,
  prisonerService,
  pdfFormatter,
  signInService
)
const formService = new FormService(pdfFormatter, prisonerService, configClient)
const reportingService = createReportingService(audit)
const userAdminService = new UserAdminService(nomisClientBuilder, userClient, probationTeamsClient)
const userService = createUserService(nomisClientBuilder, signInService, manageUsersApi)
const deadlineService = createDeadlineService(licenceClient)
const roContactDetailsService = new RoContactDetailsService(userAdminService, roService, probationTeamsClient)
const migrationService = new MigrationService(deliusClient, userAdminService, nomisClientBuilder)

const notificationSender = createNotificationSender(notifyClient, audit, config.notifications.notifyKey)
const roNotificationSender = createRoNotificationSender(notificationSender, config)
const caAndDmNotificationSender = createCaAndDmNotificationSender(
  prisonerService,
  roContactDetailsService,
  configClient,
  notificationSender,
  nomisClientBuilder,
  config
)

const eventPublisher = new EventPublisher(audit, appInsights)

const roNotificationHandler = createRoNotificationHandler(
  roNotificationSender,
  licenceService,
  prisonerService,
  roContactDetailsService,
  warningClient,
  deliusClient,
  eventPublisher
)

const notificationService = createNotificationService(
  caAndDmNotificationSender,
  licenceService,
  prisonerService,
  roNotificationHandler,
  eventPublisher
)

const reminderService = createReminderService(
  roContactDetailsService,
  prisonerService,
  deadlineService,
  roNotificationSender,
  config.notifications.activeNotificationTypes
)
const nomisPushService = createNomisPushService(nomisClientBuilder, signInService)
const notificationJobs = createNotificationJobs(reminderService, signInService)
const jobSchedulerService = createJobSchedulerService(dbLockingClient, configClient, notificationJobs)
const lduService = createLduService(deliusClient, activeLduClient)
const functionalMailboxService = new FunctionalMailboxService(deliusClient, probationTeamsClient, audit)
const licenceSearchService = createLicenceSearchService(licenceClient, signInService, nomisClientBuilder)
const reportsService = new ReportsService(licenceClient, signInService, prisonerSearchApi, probationSearchApi)
const tokenVerifier = tokenVerifierFactory(config.tokenVerification)

const app = createApp({
  tokenVerifier,
  signInService,
  licenceService,
  prisonerService,
  conditionsServiceFactory,
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
  reportsService,
  roService,
  audit,
  caService,
  warningClient,
  lduService,
  functionalMailboxService,
  roNotificationHandler,
  migrationService,
})

module.exports = app
