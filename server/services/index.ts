import { NotifyClient } from 'notifications-node-client'
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { AuditServiceFactory } from '@ministryofjustice/hmpps-audit-client'
import logger from '../../log'
import { userClient } from '../data/userClient'
import configClient from '../data/configClient'
import dbLockingClient from '../data/dbLockingClient'
import audit from '../data/audit'
import nomisClientBuilder from '../data/nomisClientBuilder'
import pdfFormatter from "./utils/pdfFormatter"
import activeLduClient from '../data/activeLduClient'
import warningClient from '../data/warningClient'
import SignInService from '../authentication/signInService'
import { createLicenceService } from "./licenceService"
import { createPrisonerService } from "./prisonerService"
import { ConditionsServiceFactory } from "./conditionsService"
import createCaseListService from "./caseListService"
import MigrationService from './migrationService'
import PdfService from './pdfService'
import FormService from './formService'
import createCaseListFormatter from './utils/caseListFormatter'
import UserAdminService from './userAdminService'
import createUserService from './userService'
import createNotificationSender from './notifications/notificationSender'
import createRoNotificationSender from './notifications/roNotificationSender'
import createCaAndDmNotificationSender from './notifications/caAndDmNotificationSender'
import createNotificationService from './notifications/notificationService'
import createRoNotificationHandler from './notifications/roNotificationHandler'
import EventPublisher from './notifications/eventPublisher'

import { RoContactDetailsService } from './roContactDetailsService'
import createReminderService from './reminderService'

import createNomisPushService from './nomisPushService'
import createDeadlineService from './deadlineService'
import createJobSchedulerService from './jobSchedulerService'
import createNotificationJobs from './jobs/notificationJobs'
import { buildRestClient, clientCredentialsTokenSource } from '../data/restClientBuilder'
import { DeliusClient } from '../data/deliusClient'
import { ProbationTeamsClient } from '../data/probationTeamsClient'
import { RoService } from './roService'
import createCaService from './caService'
import createLduService from './lduService'
import { FunctionalMailboxService } from './functionalMailboxService'
import createLicenceSearchService from './licenceSearchService'
import ReportsService from './reportsService'
import tokenVerifierFactory from '../authentication/tokenverifier/tokenVerifierFactory'
import TokenStore from '../data/tokenStore'
import { createRedisClient } from '../data/redisClient'
import prisonerSearchApi from '../data/prisonerSearchApi'
import manageUsersApi from '../data/manageUsersApi'
import probationSearchApi from '../data/probationSearchApi'
import { HdcClient } from '../data/hdcApiClient'
import { createHdcService } from './hdc/hdcService'
import AuditService from './audit/auditService'
import { licenceClient } from '../data/licenceClient'
import config from '../config'

const notifyClient = new NotifyClient(config.notifications.notifyKey)

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

const eventPublisher = new EventPublisher(audit, telemetry)

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
const nomisPushService = createNomisPushService(nomisClientBuilder, signInService, hdcService)
const notificationJobs = createNotificationJobs(reminderService, signInService)
const jobSchedulerService = createJobSchedulerService(dbLockingClient, configClient, notificationJobs)
const lduService = createLduService(deliusClient, activeLduClient)
const functionalMailboxService = new FunctionalMailboxService(deliusClient, probationTeamsClient, audit)
const licenceSearchService = createLicenceSearchService(licenceClient, signInService, nomisClientBuilder)
const reportsService = new ReportsService(licenceClient, signInService, prisonerSearchApi, probationSearchApi)
const tokenVerifier = tokenVerifierFactory(config.apis.tokenVerification)

const hmppsAuditService = AuditServiceFactory.createInstance(config.sqs.audit, logger)
const auditService = new AuditService(hmppsAuditService)

export const services = {
  tokenVerifier,
  signInService,
  licenceService,
  hdcService,
  prisonerService,
  conditionsServiceFactory,
  caseListService,
  pdfService,
  formService,
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
  auditService,
}

export type Services = typeof services
