/* eslint-disable no-underscore-dangle */
const expressWinston = require('express-winston')
const addRequestId = require('express-request-id')()
const moment = require('moment')

const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const cookieParser = require('cookie-parser')
const express = require('express')
const path = require('path')
const flash = require('connect-flash')
const pdfRenderer = require('@ministryofjustice/express-template-to-pdf')

const helmet = require('helmet')
const csurf = require('csurf')
const compression = require('compression')
const sassMiddleware = require('node-sass-middleware')
const passport = require('passport')
const ensureHttps = require('./utils/ensureHttps')

const config = require('../server/config')
const healthFactory = require('./services/healthcheck')

const logger = require('../log.js')
const auth = require('./authentication/auth')

const defaultRouter = require('../server/routes/default')

const adminRouter = require('../server/routes/admin/admin')
const userAdminRouter = require('../server/routes/admin/users')
const mailboxesAdminRouter = require('../server/routes/admin/mailboxes')
const jobsAdminRouter = require('../server/routes/admin/jobs')
const deliusAdminRouter = require('../server/routes/admin/delius')
const apiRouter = require('../server/routes/api')
const caseListRouter = require('../server/routes/caseList')
const contactRouter = require('../server/routes/contact')
const pdfRouter = require('../server/routes/pdf')
const formsRouter = require('../server/routes/forms')
const sendRouter = require('../server/routes/send')
const sentRouter = require('../server/routes/sent')
const taskListRouter = require('./routes/taskList')
const utilsRouter = require('../server/routes/utils')
const userRouter = require('../server/routes/user')

const standardRouter = require('./routes/routeWorkers/standardRouter')
const addressRouter = require('./routes/address')
const approvalRouter = require('./routes/approval')
const bassReferralRouter = require('./routes/bassReferral')
const conditionsRouter = require('./routes/conditions')
const curfewRouter = require('./routes/curfew')
const eligibilityRouter = require('./routes/eligibility')
const finalChecksRouter = require('./routes/finalChecks')
const reviewRouter = require('./routes/review')
const reportingRouter = require('./routes/reporting')
const riskRouter = require('./routes/risk')
const victimRouter = require('./routes/victim')
const varyRouter = require('./routes/vary')

const version = moment.now().toString()
const production = process.env.NODE_ENV === 'production'

module.exports = function createApp({
  signInService,
  licenceService,
  prisonerService,
  conditionsService,
  caseListService,
  pdfService,
  formService,
  userAdminService,
  reportingService,
  notificationService,
  userService,
  nomisPushService,
  configClient,
  jobSchedulerService,
  deliusRoService,
  audit,
}) {
  const app = express()

  auth.init(userService, audit)

  app.set('json spaces', 2)

  // Configure Express for running behind proxies
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true)

  // View Engine Configuration
  app.set('views', path.join(__dirname, '../server/views'))
  app.set('view engine', 'pug')
  app.use(pdfRenderer())

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
  app.use(helmet())

  app.use(addRequestId)

  app.use(
    cookieSession({
      name: 'session',
      keys: [config.sessionSecret],
      maxAge: 60 * 60 * 1000,
      secure: config.https,
      httpOnly: true,
      signed: true,
      overwrite: true,
      sameSite: 'lax',
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

  app.use(cookieParser())
  app.use(csurf({ cookie: { secure: config.https, httpOnly: true } }))

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

  if (!production) {
    app.use(
      '/public',
      sassMiddleware({
        src: path.join(__dirname, '../assets/sass'),
        dest: path.join(__dirname, '../assets/stylesheets'),
        debug: false,
        outputStyle: 'compressed',
        prefix: '/stylesheets/',
        includePaths: [
          'node_modules/govuk_frontend_toolkit/stylesheets',
          'node_modules/govuk_template_jinja/assets/stylesheets',
          'node_modules/govuk-elements-sass/public/sass',
        ],
      })
    )
  }

  //  Static Resources Configuration
  const cacheControl = { maxAge: config.staticResourceCacheDuration * 1000 }

  ;[
    '../public',
    '../assets',
    '../assets/stylesheets',
    '../node_modules/govuk_template_jinja/assets',
    '../node_modules/govuk_frontend_toolkit',
  ].forEach(dir => {
    app.use('/public', express.static(path.join(__dirname, dir), cacheControl))
  })
  ;['../node_modules/govuk_frontend_toolkit/images'].forEach(dir => {
    app.use('/public/images/icons', express.static(path.join(__dirname, dir), cacheControl))
  })

  // GovUK Template Configuration
  app.locals.asset_path = '/public/'

  function addTemplateVariables(req, res, next) {
    res.locals.user = req.user
    next()
  }

  app.use(addTemplateVariables)

  // Don't cache dynamic resources
  app.use(helmet.noCache())

  // Request logging
  app.use(
    expressWinston.logger({
      winstonInstance: logger,
      meta: true,
      dynamicMeta(req, res) {
        const meta = {
          userEmail: req.user ? req.user.username : null,
          requestId: req.id,
          sessionTag: req.user ? req.user.sessionTag : null,
        }

        if (res._headers.location) {
          meta.res_header_location = res._headers.location
        }

        return meta
      },
      colorize: true,
      requestWhitelist: ['url', 'method', 'originalUrl', 'query', 'body'],
      ignoredRoutes: ['/health', '/favicon.ico'],
    })
  )

  app.use(flash())

  app.use('/logout', (req, res) => {
    if (req.user) {
      req.logout()
    }
    res.redirect(authLogoutUrl)
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
    next()
  })

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  app.use((req, res, next) => {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  const health = healthFactory(
    config.nomis.apiUrl.replace('/api', ''),
    config.nomis.authUrl.replace('/api', ''),
    config.delius.apiUrl.replace('/api', '')
  )

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

  const authLogoutUrl = `${config.nomis.authExternalUrl}/logout?client_id=${config.nomis.apiClientId}&redirect_uri=${
    config.domain
  }`

  app.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror', {
      authURL: authLogoutUrl,
    })
  })

  app.get('/login', passport.authenticate('oauth2'))

  app.get('/login/callback', (req, res, next) => {
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
      req.logIn(user, err2 => {
        if (err2) {
          return next(err2)
        }

        return res.redirect(req.session.returnTo || '/')
      })
      return null
    })(req, res, next)
  })

  const secureRoute = standardRouter({ licenceService, prisonerService, audit, signInService, config })

  app.use((req, res, next) => {
    res.locals.tagManagerKey = config.tagManagerKey
    next()
  })

  app.use('/', secureRoute(defaultRouter()))

  app.use(
    '/hdc/taskList/',
    secureRoute(taskListRouter({ prisonerService, licenceService, caseListService, audit }), {
      licenceRequired: false,
    })
  )
  app.use('/caseList/', secureRoute(caseListRouter({ caseListService })))
  app.use('/admin/', secureRoute(adminRouter()))
  app.use('/admin/roUsers/', secureRoute(userAdminRouter({ userAdminService }), { auditKey: 'USER_MANAGEMENT' }))
  app.use('/admin/mailboxes/', secureRoute(mailboxesAdminRouter({ configClient })))
  app.use('/admin/jobs/', secureRoute(jobsAdminRouter({ jobSchedulerService })))
  app.use('/admin/delius/', secureRoute(deliusAdminRouter({ deliusRoService })))
  app.use('/hdc/contact/', secureRoute(contactRouter({ userAdminService })))
  app.use('/hdc/pdf/', secureRoute(pdfRouter({ pdfService, prisonerService }), { auditKey: 'CREATE_PDF' }))
  app.use('/hdc/forms/', secureRoute(formsRouter({ formService })))
  app.use('/hdc/send/', secureRoute(sendRouter({ licenceService, prisonerService, notificationService, audit })))
  app.use('/hdc/sent/', secureRoute(sentRouter({ prisonerService })))
  app.use('/user/', secureRoute(userRouter({ userService })))

  app.use('/hdc/proposedAddress/', secureRoute(addressRouter({ licenceService, nomisPushService })))
  app.use('/hdc/approval/', secureRoute(approvalRouter({ licenceService, prisonerService, nomisPushService })))
  app.use('/hdc/bassReferral/', secureRoute(bassReferralRouter({ licenceService })))
  app.use('/hdc/licenceConditions/', secureRoute(conditionsRouter({ licenceService, conditionsService })))
  app.use('/hdc/curfew/', secureRoute(curfewRouter({ licenceService, nomisPushService })))
  app.use('/hdc/eligibility/', secureRoute(eligibilityRouter({ licenceService, nomisPushService })))
  app.use('/hdc/finalChecks/', secureRoute(finalChecksRouter({ licenceService, nomisPushService })))
  app.use('/hdc/review/', secureRoute(reviewRouter({ licenceService, conditionsService, prisonerService })))
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
      logger.error('Unauthorised: ', error.stack)
      return res.redirect('/logout')
    default:
      next(error)
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
