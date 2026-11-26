/* eslint-disable no-underscore-dangle */
import moment from 'moment'
import { randomBytes, randomUUID } from 'crypto'
import { IncomingMessage, ServerResponse } from 'http'
import bodyParser from 'body-parser'
import express, { ErrorRequestHandler, Express, Response } from 'express'
import path from 'path'
import flash from 'connect-flash'
import session from 'express-session'
import { RedisStore } from 'connect-redis'
import helmet from 'helmet'
import noCache from 'nocache'
import { csrfSync } from 'csrf-sync'
import compression from 'compression'
import passport from 'passport'
import ensureHttps from './utils/ensureHttps'
import pdfRenderer from './utils/renderPdf'
import setupRoutes from './routes'

import config from './config'
import setUpHealthChecks from './utils/setUpHealthChecks'

import logger from '../log'
import auth from './authentication/auth'
import utilsRouter from './routes/utils'
import { GotenbergClient } from './data/gotenbergClient'
import { createRedisClient } from './data/redisClient'
import { asyncMiddleware } from './utils/middleware'
import addUserDataToTelemetry from './utils/addUserDataToTelemetry'
import { Services } from './services'
import { ApplicationInfo } from './applicationInfo'
import AuditService from './services/audit/auditService'

const version = moment.now().toString()
const {production} = config

export default function createApp(services: Services, applicationInfo: ApplicationInfo): Express {
  const {
    audit,
    auditService,
    userService,
    licenceClient,
    warningClient,
    activeLduClient,
  } = services

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

  app.use((_req, res, next) => {
    res.locals.cspNonce = randomBytes(16).toString('base64')
    next()
  })

  const scriptSrc = [
    "'self'",
    (_req: IncomingMessage, res: ServerResponse) => `'nonce-${(res as Response).locals.cspNonce}'`,
    'code.jquery.com'
  ]
  const styleSrc = [
    "'self'",
    (_req: IncomingMessage, res: ServerResponse) => `'nonce-${(res as Response).locals.cspNonce}'`,
    'code.jquery.com',
    'fonts.googleapis.com'
  ]

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: {policy: 'cross-origin'},
      referrerPolicy: {policy: 'same-origin'},
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc,
          styleSrc,
          fontSrc: ["'self'"],
          imgSrc: ["'self'"],
          connectSrc: ["'self'"],
          formAction: ["'self'"]
        }
      }
    })
  )

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
      store: new RedisStore({client}),
      cookie: {secure: config.https, sameSite: 'lax', maxAge: config.session.expiryMinutes * 60 * 1000},
      secret: config.session.secret,
      resave: false, // redis implements touch so shouldn't need this
      saveUninitialized: false,
      rolling: true
    })
  )

  app.use(passport.initialize())
  app.use(passport.session())

  // Request Processing Configuration
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  if (config.enableTestUtils === 'true') {
    app.use('/utils/', utilsRouter({ licenceClient, auditClient: audit, warningClient, activeLduClient }))
  }

  const testMode = process.env.NODE_ENV === 'test'

  // CSRF protection
  if (!testMode) {
    const {
      csrfSynchronisedProtection // This is the default CSRF protection middleware.
    } = csrfSync({
      // By default, csrf-sync uses x-csrf-token header, but we use the token in forms and send it in the request body, so change getTokenFromRequest so it grabs from there
      getTokenFromRequest: (req) => {
        return req.body._csrf
      }
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
  const cacheControl = {maxAge: config.staticResourceCacheDuration * 1000}

  ;[
    '/public',
    '/assets',
    '/assets/stylesheets',
    '/node_modules/govuk_template_jinja/assets',
    '/node_modules/govuk_frontend_toolkit'
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
      authUrl: config.apis.auth.url,
      apiClientId: config.apis.auth.apiClientId,
      exitUrl: config.links.exitUrl
    }
    next()
  }

  app.use(addTemplateVariables)

  app.use(addUserDataToTelemetry())

  function addReturnURL(req, res, next) {
    const returnUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    res.locals.returnUrl = encodeURIComponent(returnUrl)
    next()
  }

  app.use(addReturnURL)

  // Don't cache dynamic resources
  app.use(noCache())

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

  app.use(setUpHealthChecks(applicationInfo))

  app.get('/robots.txt', (req, res) => {
    res.type('text/plain')
    res.send('User-agent: *\nDisallow: /')
  })

  app.get('/feedback', (req, res) => {
    return res.render('feedback', {returnURL: req.get('referer')})
  })

  if (production) {
    app.use(ensureHttps)
  }

  app.get('/notfound', (req, res) => {
    res.status(404)
    return res.render('notfound')
  })

  const authLogoutUrl = `${config.apis.auth.authExternalUrl}/logout?client_id=${config.apis.auth.apiClientId}&redirect_uri=${config.domain}`

  app.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror', {
      authURL: authLogoutUrl
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

  app.locals.feedbackAndSupportUrl = config.links.feedbackAndSupportUrl
  app.locals.createAndVaryALicenceCreateCaseloadUrl = config.links.createAndVaryALicenceCreateCaseloadUrl
  app.locals.hdcCreationInCvlEnabled = config.hdcCreationInCvlEnabled
  app.locals.createAndVaryALicenceVaryCaseloadUrl = config.links.createAndVaryALicenceVaryCaseloadUrl
  app.locals.createAndVaryALicenceInCvlInfoUrl = config.links.createAndVaryALicenceInCvlInfoUrl
  app.locals.createAndVaryALicenceSupportUrl = config.links.createAndVaryALicenceSupportUrl

  app.locals.isHdcInCvlNationalRoleOut = config.hdcInCvlNationalRoleOut.isActive

  app.use(setupRoutes(services))

  // Error Handler
  app.use((req, res) => {
    res.redirect('/notfound')
  })

  app.use(handleKnownErrors(auditService))
  app.use(renderErrors)

  return app
}

function handleKnownErrors(auditService: AuditService) : ErrorRequestHandler {
  return async (error, req, res, next) =>  {
    if (error.code === 'EBADCSRFTOKEN') {
      logger.error(`Bad csurf token: ${error.stack}`)
    }

    if (error.name === 'NomisPushConflict') {
      await auditService.logPageAccessFailure(req, res.locals.prisoner, 'nomis push conflict', res.locals.user)
      return res.render('nomis-push-error-409', {error})
    }

    switch (error.status) {
      case 401:
        await auditService.logPageAccessFailure(req, res.locals.prisoner, 'User is not authorized to access this page', res.locals.user)
        return res.redirect('/logout')
      case 403:
        await auditService.logPageAccessFailure(req, res.locals.prisoner, 'User is forbidden from accessing this page', res.locals.user)
        return res.redirect('/logout')
      default:
        await auditService.logPageAccessFailure(req, res.locals.prisoner, 'Unknown error', res.locals.user)
        return next(error)
    }
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
