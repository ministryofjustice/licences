/* eslint-disable no-underscore-dangle */
const moment = require('moment')
const uuid = require('uuid')
const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')
const flash = require('connect-flash')
const session = require('express-session')
const RedisStore = require('connect-redis').default

const helmet = require('helmet').default
const noCache = require('nocache')

const csurf = require('csurf')
const compression = require('compression')
const passport = require('passport')
const ensureHttps = require('./utils/ensureHttps')
const pdfRenderer = require('./utils/renderPdf')

const config = require('./config')
const healthFactory = require('./services/healthcheck')

const logger = require('../log')
const auth = require('./authentication/auth')

const defaultRouter = require('./routes/default')

const adminRouter = require('./routes/admin/admin')
const userAdminRouter = require('./routes/admin/users')
const manageRolesRouter = require('./routes/admin/manageRoles')
const mailboxesAdminRouter = require('./routes/admin/mailboxes')
const jobsAdminRouter = require('./routes/admin/jobs')
const deliusAdminRouter = require('./routes/admin/delius')
const locationsRouter = require('./routes/admin/locations')
const warningsRouter = require('./routes/admin/warnings')
const licenceSearchRouter = require('./routes/admin/licenceSearch')
const licencesWithCOMRouter = require('./routes/admin/licencesWithCOM')
const licenceRouter = require('./routes/admin/licence')
const { functionalMailboxRouter } = require('./routes/admin/functionalMailboxes')
const apiRouter = require('./routes/api')

const caseListRouter = require('./routes/caseList')
const contactRouter = require('./routes/contact')
const pdfRouter = require('./routes/pdf').default
const formsRouter = require('./routes/forms').default
const sendRouter = require('./routes/send')
const sentRouter = require('./routes/sent')
const taskListRouter = require('./routes/taskList')
const utilsRouter = require('./routes/utils')
const userRouter = require('./routes/user')

const standardRouter = require('./routes/routeWorkers/standardRouter')
const addressRouter = require('./routes/address')
const approvalRouter = require('./routes/approval')
const bassReferralRouter = require('./routes/bassReferral')
const conditionsRouter = require('./routes/conditions').default
const curfewRouter = require('./routes/curfew')
const eligibilityRouter = require('./routes/eligibility')
const finalChecksRouter = require('./routes/finalChecks').default
const reviewRouter = require('./routes/review')
const reportingRouter = require('./routes/reporting')
const riskRouter = require('./routes/risk').default
const victimRouter = require('./routes/victim')
const { GotenbergClient } = require('./data/gotenbergClient')
const { varyRouter } = require('./routes/vary')
const { createRedisClient } = require('./data/redisClient')
const { asyncMiddleware } = require('./utils/middleware')

const version = moment.now().toString()
const { production } = config

module.exports = function createApp({
  tokenVerifier,
  signInService,
  licenceService,
  prisonerService,
  conditionsServiceFactory,
  caseListService,
  pdfService,
  formService,
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
}) {
  const app = express()

  auth.init(userService, audit)

  app.set('json spaces', 2)

  // Configure Express for running behind proxies
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true)

  // View Engine Configuration
  app.set('views', path.join(__dirname, './views'))
  app.set('view engine', 'pug')

  app.use(pdfRenderer(new GotenbergClient(config.gotenberg.apiUrl)))

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
    const id = oldValue === undefined ? uuid.v4() : oldValue

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

  app.use(csurf())

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
      authUrl: config.nomis.authUrl,
      apiClientId: config.nomis.apiClientId,
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

  // token refresh
  app.use(async (req, res, next) => {
    if (production && req.user) {
      const timeToRefresh = new Date() > req.user.refreshTime
      if (timeToRefresh) {
        try {
          const newToken = await signInService.getRefreshedToken(req.user)
          req.user.token = newToken.token
          req.user.refreshToken = newToken.refreshToken
          req.user.refreshTime = newToken.refreshTime
        } catch (error) {
          logger.error(`Elite 2 token refresh error: ${req.user.username}`, error.stack)
          return res.redirect('/logout')
        }
      }
    }
    return next()
  })

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  app.use(
    asyncMiddleware((req, res, next) => {
      req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
      next()
    })
  )

  const health = healthFactory({
    prisonApi: `${config.nomis.apiUrl}/health/ping`,
    auth: `${config.nomis.authUrl}/health/ping`,
    delius: `${config.delius.apiUrl}/health/ping`,
    probationTeams: `${config.probationTeams.apiUrl}/health/ping`,
    manageUsersApi: `${config.manageUsersApi.apiUrl}/health/ping`,
  })

  app.get('/health', (req, res, next) => {
    health((err, result) => {
      if (err) {
        return next(err)
      }
      if (!(result.status === 'UP')) {
        res.status(503)
      }
      res.json(result)
      return result
    })
  })

  app.get('/ping', (req, res) => res.send('pong'))

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

  const authLogoutUrl = `${config.nomis.authExternalUrl}/logout?client_id=${config.nomis.apiClientId}&redirect_uri=${config.domain}`

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
  app.use(
    '/admin/downloadCasesWithCOM/',
    secureRoute(licencesWithCOMRouter(licenceSearchService), { auditKey: 'LICENCE_STAGE_COM_DOWNLOAD' })
  )
  app.use(
    '/admin/licences/',
    secureRoute(
      licenceRouter(licenceService, signInService, prisonerService, audit, roNotificationHandler, nomisPushService)
    )
  )
  app.use('/admin/functionalMailboxes', secureRoute(functionalMailboxRouter(functionalMailboxService)))

  app.use('/hdc/contact/', secureRoute(contactRouter(userAdminService, roService, signInService)))
  app.use('/hdc/pdf/', secureRoute(pdfRouter(pdfService, prisonerService), { auditKey: 'CREATE_PDF' }))
  app.use('/hdc/forms/', secureRoute(formsRouter(formService, conditionsServiceFactory)))
  app.use('/hdc/send/', secureRoute(sendRouter({ prisonerService, notificationService })))
  app.use('/hdc/sent/', secureRoute(sentRouter({ prisonerService })))
  app.use('/user/', secureRoute(userRouter({ userService })))

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

// eslint-disable-next-line no-unused-vars
function renderErrors(error, req, res, next) {
  logger.error(`Unhandled error: ${error.stack}`)

  res.locals.error = error
  res.locals.stack = production ? null : error.stack
  res.locals.message = production ? 'Something went wrong. The error has been logged. Please try again' : error.message

  res.status(error.status || 500)

  res.render('error')
}
