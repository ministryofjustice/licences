import { Router } from 'express'
import defaultRouter from './default'
import userAdminRouter from './admin/users'
import userRouter from './user'
import config from '../config'
import { Services } from '../services'
import adminRouter from './admin/admin'
import manageRolesRouter from './admin/manageRoles'
import mailboxesAdminRouter from './admin/mailboxes'
import jobsAdminRouter from './admin/jobs'
import deliusAdminRouter from './admin/delius'
import locationsRouter from './admin/locations'
import warningsRouter from './admin/warnings'
import licenceSearchRouter from './admin/licenceSearch'
import licencesWithCOMRouter from './admin/licencesWithCOM'
import licencesWithCARouter from './admin/comAssignmentForLicencesWithCA'
import licenceCompletionDestinationSearchRouter from './admin/completionDestinationSearch'
import conditionCompareTextsSearch from './admin/conditionCompareTextsSearch'
import licenceCompletionDestinationRouter from './admin/completionDestination'
import licenceRouter from './admin/licence'
import migrationRouter from './admin/migrateToCvl'
import { functionalMailboxRouter } from './admin/functionalMailboxes'

import caseListRouter from './caseList'
import contactRouter from './contact'
import pdfRouter from './pdf'
import formsRouter from './forms'
import sendRouter from './send'
import sentRouter from './sent'
import taskListRouter from './taskList'
import caReportsRouter from './caReports'

import standardRouter from './routeWorkers/standardRouter'
import addressRouter from './address'
import approvalRouter from './approval'
import bassReferralRouter from './bassReferral'
import conditionsRouter from './conditions'
import curfewRouter from './curfew'
import eligibilityRouter from './eligibility'
import finalChecksRouter from './finalChecks'
import reviewRouter from './review'
import reportingRouter from './reporting'
import riskRouter from './risk'
import victimRouter from './victim'
import { varyRouter } from './vary'

export default function Index({
                                audit,
                                auditService,
                                caseListService,
                                conditionsServiceFactory,
                                configClient,
                                caService,
                                formService,
                                functionalMailboxService,
                                hdcService,
                                jobSchedulerService,
                                lduService,
                                licenceSearchService,
                                licenceService,
                                migrationService,
                                eventService,
                                notificationService,
                                pdfService,
                                prisonerService,
                                reportsService,
                                roNotificationHandler,
                                roService,
                                signInService,
                                tokenVerifier,
                                userAdminService,
                                userService,
                                warningClient,
                              }: Services): Router {
  const router = Router({mergeParams: true})

  const secureRoute = standardRouter({auditService, licenceService, prisonerService, audit, signInService, tokenVerifier, config})

  router.get('/', secureRoute(defaultRouter()))

  router.use(
    '/hdc/taskList/',
    secureRoute(taskListRouter(prisonerService, licenceService, roService, hdcService, audit, caService, signInService)))
  router.use('/caseList/', secureRoute(caseListRouter({auditService, caseListService})))
  router.use('/admin/', secureRoute(adminRouter()))
  router.use(
    '/admin/roUsers/',
    secureRoute(userAdminRouter({userAdminService, signInService, migrationService}), {auditKey: 'USER_MANAGEMENT'})
  )
  router.use('/admin/manage-roles/', secureRoute(manageRolesRouter(migrationService), {auditKey: 'USER_MANAGEMENT'}))
  router.use('/admin/mailboxes/', secureRoute(mailboxesAdminRouter({configClient})))
  router.use('/admin/jobs/', secureRoute(jobsAdminRouter({jobSchedulerService})))
  router.use('/admin/delius/', secureRoute(deliusAdminRouter(roService)))
  router.use('/admin/warnings/', secureRoute(warningsRouter(warningClient), {auditKey: 'WARNINGS'}))
  router.use('/admin/locations/', secureRoute(locationsRouter(lduService), {auditKey: 'LOCATIONS'}))
  router.use(
    '/admin/licenceSearch/',
    secureRoute(licenceSearchRouter(licenceSearchService), {auditKey: 'LICENCE_SEARCH'})
  )
  router.use('/admin/downloadCasesWithCOM/', secureRoute(licencesWithCOMRouter(reportsService, audit)))
  router.use('/admin/downloadCasesWithCA/', secureRoute(licencesWithCARouter(reportsService, audit)))
  router.use(
    '/admin/completionDestinationSearch/',
    secureRoute(licenceCompletionDestinationSearchRouter(licenceSearchService))
  )
  router.use('/admin/conditionCompareTextsSearch/', secureRoute(conditionCompareTextsSearch(hdcService)))
  router.use(
    '/admin/completionDestination/',
    secureRoute(licenceCompletionDestinationRouter(licenceService, signInService, prisonerService, audit))
  )
  router.use(
    '/admin/licences/',
    secureRoute(
      licenceRouter(licenceService, signInService, prisonerService, audit, roNotificationHandler, eventService)
    )
  )
  router.use('/admin/functionalMailboxes', secureRoute(functionalMailboxRouter(functionalMailboxService)))
  router.use('/admin/migrateToCvl', secureRoute(migrationRouter(hdcService)))
  router.use('/hdc/contact/', secureRoute(contactRouter(userAdminService, roService, signInService)))
  router.use('/hdc/pdf/', secureRoute(pdfRouter(pdfService, prisonerService), {auditKey: 'CREATE_PDF'}))
  router.use('/hdc/forms/', secureRoute(formsRouter(formService, conditionsServiceFactory)))
  router.use('/hdc/send/', secureRoute(sendRouter({prisonerService, notificationService, hdcService})))
  router.use('/hdc/sent/', secureRoute(sentRouter({prisonerService})))
  router.use('/user/', secureRoute(userRouter({userService}))
  )
  router.use('/hdc/people-ready-for-probation-checks', secureRoute(caReportsRouter(reportsService, audit)))

  router.use('/hdc/proposedAddress/', secureRoute(addressRouter({licenceService, eventService, hdcService})))
  router.use('/hdc/approval/', secureRoute(approvalRouter({
    licenceService,
    prisonerService,
    eventService,
    hdcService
  })))
  router.use('/hdc/bassReferral/', secureRoute(bassReferralRouter({licenceService, eventService, hdcService})))
  router.use('/hdc/licenceConditions/', secureRoute(conditionsRouter({licenceService, conditionsServiceFactory})))
  router.use('/hdc/curfew/', secureRoute(curfewRouter({licenceService, eventService, hdcService})))
  router.use('/hdc/eligibility/', secureRoute(eligibilityRouter({licenceService, eventService})))
  router.use('/hdc/finalChecks/', secureRoute(finalChecksRouter({licenceService, eventService, hdcService})))
  router.use('/hdc/review/', secureRoute(reviewRouter({licenceService, conditionsServiceFactory, prisonerService})))
  router.use('/hdc/reporting/', secureRoute(reportingRouter({licenceService})))
  router.use('/hdc/risk/', secureRoute(riskRouter({licenceService})))
  router.use('/hdc/victim/', secureRoute(victimRouter({licenceService})))
  router.use('/hdc/vary/', secureRoute(varyRouter({licenceService, prisonerService})))

  return router
}
