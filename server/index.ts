/* eslint-disable import/first */
// eslint-disable-next-line import/no-import-module-exports
import getApplicationInfo from './applicationInfo'

import { initialiseAppInsights, buildAppInsightsClient } from './utils/azureAppInsights'

initialiseAppInsights()
const applicationInfo = getApplicationInfo()
const appInsightsClient = buildAppInsightsClient(applicationInfo)
// eslint-disable-next-line import/order
import { NotifyClient } from 'notifications-node-client'
import createApp from './app'
import logger from '../log'
import config from './config'
import audit from './data/audit'

import { licenceClient } from './data/licenceClient'
import { userClient } from './data/userClient'
import configClient from './data/configClient'
import dbLockingClient from './data/dbLockingClient'
import nomisClientBuilder from './data/nomisClientBuilder'
import pdfFormatter from './services/utils/pdfFormatter'
import activeLduClient from './data/activeLduClient'
import warningClient from './data/warningClient'

const notifyClient = new NotifyClient(config.notifications.notifyKey)
import SignInService from './authentication/signInService'
import { createLicenceService } from './services/licenceService'
import { createPrisonerService } from './services/prisonerService'
import { ConditionsServiceFactory } from './services/conditionsService'
import createCaseListService from './services/caseListService'
import MigrationService from './services/migrationService'
import PdfService from './services/pdfService'
import FormService from './services/formService'
import createReportingService from './services/reportingService'
import createCaseListFormatter from './services/utils/caseListFormatter'
import UserAdminService from './services/userAdminService'
import createUserService from './services/userService'
import createNotificationSender from './services/notifications/notificationSender'
import createRoNotificationSender from './services/notifications/roNotificationSender'
import createCaAndDmNotificationSender from './services/notifications/caAndDmNotificationSender'
import createNotificationService from './services/notifications/notificationService'
import createRoNotificationHandler from './services/notifications/roNotificationHandler'
import EventPublisher from './services/notifications/eventPublisher'

import { RoContactDetailsService } from './services/roContactDetailsService'
import createReminderService from './services/reminderService'

import createNomisPushService from './services/nomisPushService'
import createDeadlineService from './services/deadlineService'
import createJobSchedulerService from './services/jobSchedulerService'
import createNotificationJobs from './services/jobs/notificationJobs'
import { buildRestClient, clientCredentialsTokenSource } from './data/restClientBuilder'
import { DeliusClient } from './data/deliusClient'
import { ProbationTeamsClient } from './data/probationTeamsClient'
import { RoService } from './services/roService'
import createCaService from './services/caService'
import createLduService from './services/lduService'
import { FunctionalMailboxService } from './services/functionalMailboxService'
import createLicenceSearchService from './services/licenceSearchService'
import ReportsService from './services/reportsService'
import tokenVerifierFactory from './authentication/tokenverifier/tokenVerifierFactory'
import TokenStore from './data/tokenStore'
import { createRedisClient } from './data/redisClient'
import prisonerSearchApi from './data/prisonerSearchApi'
import manageUsersApi from './data/manageUsersApi'
import probationSearchApi from './data/probationSearchApi'
import { HdcClient } from './data/hdcApiClient'
import { createHdcService } from './services/hdc/hdcService'

const signInService = new SignInService(new TokenStore(createRedisClient()))

const hdcClient = new HdcClient(
  buildRestClient(clientCredentialsTokenSource(signInService), config.apis.hdc.url, 'HDC API', {
    timeout: config.apis.hdc.timeout,
    agent: config.apis.hdc.agent,
  })
)

const licenceService = createLicenceService(licenceClient)
const conditionsServiceFactory = new ConditionsServiceFactory()
const hdcService = createHdcService(hdcClient, licenceService, conditionsServiceFactory)

const deliusClient = new DeliusClient(
  buildRestClient(
    clientCredentialsTokenSource(signInService),
    config.apis.delius.url,
    'Delius Integration API',
    { timeout: config.apis.delius.timeout, agent: config.apis.delius.agent }
  )
)

const probationTeamsClient = new ProbationTeamsClient(
  buildRestClient(
    clientCredentialsTokenSource(signInService),
    config.apis.probationTeams.url,
    'probation-teams',
    { timeout: config.apis.probationTeams.timeout, agent: config.apis.probationTeams.agent }
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

const eventPublisher = new EventPublisher(audit, appInsightsClient)

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
const tokenVerifier = tokenVerifierFactory(config.apis.tokenVerification)

const app = createApp({
  tokenVerifier,
  signInService,
  licenceService,
  hdcService,
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
  applicationInfo,
})

export default app
