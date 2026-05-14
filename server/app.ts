/* eslint-disable no-underscore-dangle */
import moment from 'moment'
import { randomUUID } from 'crypto'
import bodyParser from 'body-parser'
import express from 'express'
import path from 'path'
import flash from 'connect-flash'
import session from 'express-session'
import { RedisStore } from 'connect-redis'
import helmet from 'helmet'
import noCache from 'nocache'
import { Express} from 'express'
import { csrfSync } from 'csrf-sync'
import compression from 'compression'
import passport from 'passport'
import { appInsightsMiddleware } from  './utils/azureAppInsights'
import ensureHttps from './utils/ensureHttps'
import pdfRenderer from './utils/renderPdf'

import config from './config'
import setUpHealthChecks from './utils/setUpHealthChecks'

import logger from '../log'
import auth from './authentication/auth'

import defaultRouter from './routes/default'

import adminRouter from './routes/admin/admin'
import userAdminRouter from './routes/admin/users'
import manageRolesRouter from './routes/admin/manageRoles'
import mailboxesAdminRouter from './routes/admin/mailboxes'
import jobsAdminRouter from './routes/admin/jobs'
import deliusAdminRouter from './routes/admin/delius'
import locationsRouter from './routes/admin/locations'
import warningsRouter from './routes/admin/warnings'
import licenceSearchRouter from './routes/admin/licenceSearch'
import licencesWithCOMRouter from './routes/admin/licencesWithCOM'
import licencesWithCARouter from './routes/admin/comAssignmentForLicencesWithCA'
import licenceCompletionDestinationSearchRouter from './routes/admin/completionDestinationSearch'
import conditionCompareTextsSearch from './routes/admin/conditionCompareTextsSearch'
import licenceCompletionDestinationRouter from './routes/admin/completionDestination'
import licenceRouter from './routes/admin/licence'
import migrationRouter from './routes/admin/migrateToCvl'
import { functionalMailboxRouter } from './routes/admin/functionalMailboxes'
import apiRouter from './routes/api'

import caseListRouter from './routes/caseList'
import contactRouter from './routes/contact'
import pdfRouter from './routes/pdf'
import formsRouter from './routes/forms'
import sendRouter from './routes/send'
import sentRouter from './routes/sent'
import taskListRouter from './routes/taskList'
import utilsRouter from './routes/utils'
import userRouter from './routes/user'
import caReportsRouter from './routes/caReports'

import standardRouter from './routes/routeWorkers/standardRouter'
import addressRouter from './routes/address'
import approvalRouter from './routes/approval'
import bassReferralRouter from './routes/bassReferral'
import conditionsRouter from './routes/conditions'
import curfewRouter from './routes/curfew'
import eligibilityRouter from './routes/eligibility'
import finalChecksRouter from './routes/finalChecks'
import reviewRouter from './routes/review'
import reportingRouter from './routes/reporting'
import riskRouter from './routes/risk'
import victimRouter from './routes/victim'
import { GotenbergClient } from './data/gotenbergClient'
import { varyRouter } from './routes/vary'
import { createRedisClient } from './data/redisClient'
import { asyncMiddleware } from './utils/middleware'

const version = moment.now().toString()
const { production } = config

export default function createApp({
  tokenVerifier,
  signInService,
  licenceService,
  hdcService,
  prisonerService,
  conditionsServiceFactory,
  caseListService,
  pdfService,
  formService,
  reportsService,
  licenceSearchService,
  userAdminService,
  reportingService,
  notificationService,
  userService,
  nomisPushService,
  configClient,
  jobSchedulerService,
  roService,
  audit,
  caService,
  warningClient,
  lduService,
  functionalMailboxService,
  roNotificationHandler,
  migrationService,
  applicationInfo,
}): Express {
  const app = express()

  auth.init(userService, audit)

  app.set('json spaces', 2)

  // Configure Express for running behind proxies
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true)

  // View Engine Configuration
  app.set('views', path.join(__dirname, './views'))
  app.set('view engine', 'pug')

  app.use(pdfRenderer(new GotenbergClient(config.apis.gotenberg.url)))

  // Server Configuration
  app.set('port', config.port)

  // HACK: Azure doesn't support X-Forwarded-Proto so we add it manually
  // http://stackoverflow.com/a/18455265/173062
  app.use((req, res, next) => {
    if (req.headers['x-arr-ssl'] && !req.headers['x-forwarded-proto']) {
      req.headers['x-forwarded-proto'] = 'https'
    }
    return next()
  })

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }))

  app.use((req, res, next) => {
    const headerName = 'X-Request-Id'
    const oldValue = req.get(headerName)
    const id = oldValue === undefined ? randomUUID() : oldValue

    res.set(headerName, id)
    req.id = id

    next()
  })

  const client = createRedisClient()
  client.connect()

  app.use(
    session({
      store: new RedisStore({ client }),
      cookie: { secure: config.https, sameSite: 'lax', maxAge: config.session.expiryMinutes * 60 * 1000 },
      secret: config.session.secret,
      resave: false, // redis implements touch so shouldn't need this
      saveUninitialized: false,
      rolling: true,
    })
  )

  app.use(passport.initialize())
  app.use(passport.session())

  // Request Processing Configuration
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  if (config.enableTestUtils === 'true') {
    app.use('/utils/', utilsRouter())
  }

  const testMode = process.env.NODE_ENV === 'test'

  // CSRF protection
  if (!testMode) {
    const {
      csrfSynchronisedProtection, // This is the default CSRF protection middleware.
    } = csrfSync({
      // By default, csrf-sync uses x-csrf-token header, but we use the token in forms and send it in the request body, so change getTokenFromRequest so it grabs from there
      getTokenFromRequest: (req) => {
        return req.body._csrf
      },
    })

    app.use(csrfSynchronisedProtection)
  }

  app.use((req, res, next) => {
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })

  // Resource Delivery Configuration
  app.use(compression())

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = version
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = moment.now().toString()
      return next()
    })
  }

  //  Static Resources Configuration
  const cacheControl = { maxAge: config.staticResourceCacheDuration * 1000 }

  ;[
    '/public',
    '/assets',
    '/assets/stylesheets',
    '/node_modules/govuk_template_jinja/assets',
    '/node_modules/govuk_frontend_toolkit',
  ].forEach((dir) => {
    app.use('/public', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  ;['/node_modules/govuk_frontend_toolkit/images'].forEach((dir) => {
    app.use('/public/images/icons', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  // GovUK Template Configuration
  app.locals.asset_path = '/public/'

  function addTemplateVariables(req, res, next) {
    res.locals = {
      ...res.locals,
      user: req.user,
      currentUrlPath: req.baseUrl + req.path,
      hostname: req.hostname,
      authUrl: config.apis.nomis.authUrl,
      apiClientId: config.apis.nomis.apiClientId,
      exitUrl: config.links.exitUrl,
    }
    next()
  }

  app.use(addTemplateVariables)

  function addReturnURL(req, res, next) {
    const returnUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    res.locals.returnUrl = encodeURIComponent(returnUrl)
    next()
  }

  app.use(addReturnURL)

  // Don't cache dynamic resources
  app.use(noCache())

  const excludedPaths = /^\/public|^\/assets|^\/health|^\/ping|^\/favicon.ico/
  app.use((req, res, next) => {
    if (excludedPaths.test(req.path)) {
      return next()
    }

    logger.log({
      message: 'Request',
      level: 'info',
      path: req.path,
      username: req.user && req.user.username,
      role: req.user && req.user.role,
    })
    return next()
  })

  app.use(flash())

  app.use('/logout', (req, res) => {
    if (req.user) {
      return req.logout(() => {
        req.session.destroy()
        res.redirect(authLogoutUrl)
      })
    }
    return res.redirect(authLogoutUrl)
  })

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  app.use(
    asyncMiddleware((req, res, next) => {
      req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
      next()
    })
  )

  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(applicationInfo))

  app.get('/robots.txt', (req, res) => {
    res.type('text/plain')
    res.send('User-agent: *\nDisallow: /')
  })

  app.get('/feedback', (req, res) => {
    return res.render('feedback', { returnURL: req.get('referer') })
  })

  if (production) {
    app.use(ensureHttps)
  }

  app.get('/notfound', (req, res) => {
    res.status(404)
    return res.render('notfound')
  })

  const authLogoutUrl = `${config.apis.nomis.authExternalUrl}/logout?client_id=${config.apis.nomis.apiClientId}&redirect_uri=${config.domain}`

  app.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror', {
      authURL: authLogoutUrl,
    })
  })

  app.get('/login', passport.authenticate('oauth2'))

  app.get(
    '/login/callback',
    asyncMiddleware((req, res, next) => {
      passport.authenticate('oauth2', (err, user, info) => {
        if (err) {
          return res.redirect('/autherror')
        }
        if (!user) {
          if (info && info.message === 'Unable to verify authorization request state.') {
            // failure to due authorisation state not being there on return, so retry
            logger.info('Retrying auth callback as no state found')
            return res.redirect('/')
          }
          logger.info(`Auth failure due to ${JSON.stringify(info)}`)
          return res.redirect('/autherror')
        }
        req.logIn(user, (err2) => {
          if (err2) {
            return next(err2)
          }

          return res.redirect(req.session.returnTo || '/')
        })
        return null
      })(req, res, next)
    })
  )

  const secureRoute = standardRouter({ licenceService, prisonerService, audit, signInService, tokenVerifier, config })

  app.locals.tagManagerKey = config.tagManagerKey
  app.locals.feedbackAndSupportUrl = config.links.feedbackAndSupportUrl

  app.use('/', secureRoute(defaultRouter()))

  app.use(
    '/hdc/taskList/',
    secureRoute(taskListRouter(prisonerService, licenceService, audit, caService, signInService), {
      licenceRequired: false,
    })
  )
  app.use('/caseList/', secureRoute(caseListRouter({ caseListService })))
  app.use('/admin/', secureRoute(adminRouter()))
  app.use(
    '/admin/roUsers/',
    secureRoute(userAdminRouter({ userAdminService, signInService, migrationService }), { auditKey: 'USER_MANAGEMENT' })
  )
  app.use('/admin/manage-roles/', secureRoute(manageRolesRouter(migrationService), { auditKey: 'USER_MANAGEMENT' }))
  app.use('/admin/mailboxes/', secureRoute(mailboxesAdminRouter({ configClient })))
  app.use('/admin/jobs/', secureRoute(jobsAdminRouter({ jobSchedulerService })))
  app.use('/admin/delius/', secureRoute(deliusAdminRouter(roService)))
  app.use('/admin/warnings/', secureRoute(warningsRouter(warningClient), { auditKey: 'WARNINGS' }))
  app.use('/admin/locations/', secureRoute(locationsRouter(lduService), { auditKey: 'LOCATIONS' }))
  app.use(
    '/admin/licenceSearch/',
    secureRoute(licenceSearchRouter(licenceSearchService), { auditKey: 'LICENCE_SEARCH' })
  )
  app.use('/admin/downloadCasesWithCOM/', secureRoute(licencesWithCOMRouter(reportsService, audit)))
  app.use('/admin/downloadCasesWithCA/', secureRoute(licencesWithCARouter(reportsService, audit)))
  app.use(
    '/admin/completionDestinationSearch/',
    secureRoute(licenceCompletionDestinationSearchRouter(licenceSearchService))
  )
  app.use('/admin/conditionCompareTextsSearch/', secureRoute(conditionCompareTextsSearch(hdcService)))
  app.use(
    '/admin/completionDestination/',
    secureRoute(licenceCompletionDestinationRouter(licenceService, signInService, prisonerService, audit))
  )
  app.use(
    '/admin/licences/',
    secureRoute(
      licenceRouter(licenceService, signInService, prisonerService, audit, roNotificationHandler, nomisPushService)
    )
  )
  app.use('/admin/functionalMailboxes', secureRoute(functionalMailboxRouter(functionalMailboxService)))
  app.use('/admin/migrateToCvl', secureRoute(migrationRouter(hdcService)))
  app.use('/hdc/contact/', secureRoute(contactRouter(userAdminService, roService, signInService)))
  app.use('/hdc/pdf/', secureRoute(pdfRouter(pdfService, prisonerService), { auditKey: 'CREATE_PDF' }))
  app.use('/hdc/forms/', secureRoute(formsRouter(formService, conditionsServiceFactory)))
  app.use('/hdc/send/', secureRoute(sendRouter({ prisonerService, notificationService })))
  app.use('/hdc/sent/', secureRoute(sentRouter({ prisonerService })))
  app.use('/user/', secureRoute(userRouter({ userService })))
  app.use('/hdc/people-ready-for-probation-checks', secureRoute(caReportsRouter(reportsService, audit)))

  app.use('/hdc/proposedAddress/', secureRoute(addressRouter({ licenceService, nomisPushService })))
  app.use('/hdc/approval/', secureRoute(approvalRouter({ licenceService, prisonerService, nomisPushService })))
  app.use('/hdc/bassReferral/', secureRoute(bassReferralRouter({ licenceService, nomisPushService })))
  app.use('/hdc/licenceConditions/', secureRoute(conditionsRouter({ licenceService, conditionsServiceFactory })))
  app.use('/hdc/curfew/', secureRoute(curfewRouter({ licenceService, nomisPushService })))
  app.use('/hdc/eligibility/', secureRoute(eligibilityRouter({ licenceService, nomisPushService })))
  app.use('/hdc/finalChecks/', secureRoute(finalChecksRouter({ licenceService, nomisPushService })))
  app.use('/hdc/review/', secureRoute(reviewRouter({ licenceService, conditionsServiceFactory, prisonerService })))
  app.use('/hdc/reporting/', secureRoute(reportingRouter({ licenceService })))
  app.use('/hdc/risk/', secureRoute(riskRouter({ licenceService })))
  app.use('/hdc/victim/', secureRoute(victimRouter({ licenceService })))
  app.use('/hdc/vary/', secureRoute(varyRouter({ licenceService, prisonerService })))

  // hide functionality until authorisation strategy is established
  if (!production) {
    app.use('/api/', apiRouter({ reportingService }))
  }

  // Error Handler
  app.use((req, res) => {
    res.redirect('/notfound')
  })

  app.use(handleKnownErrors)
  app.use(renderErrors)

  return app
}

function handleKnownErrors(error, req, res, next) {
  if (error.code === 'EBADCSRFTOKEN') {
    logger.error(`Bad csurf token: ${error.stack}`)
  }

  if (error.name === 'NomisPushConflict') {
    return res.render('nomis-push-error-409', { error })
  }

  switch (error.status) {
    case 401:
      return res.redirect('/logout')
    case 403:
      return res.redirect('/logout')
    default:
      return next(error)
  }
}

function renderErrors(error, req, res, next) {
  logger.error(`Unhandled error: ${error.stack}`)

  res.locals.error = error
  res.locals.stack = production ? null : error.stack
  res.locals.message = production ? 'Something went wrong. The error has been logged. Please try again' : error.message

  res.status(error.status || 500)

  res.render('error')
}
