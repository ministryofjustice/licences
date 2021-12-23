const request = require('supertest')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const passport = require('passport')
const pdfRenderer = require('../server/utils/renderPdf')
const { mockAudit } = require('./mockClients')
const NullTokenVerifier = require('../server/authentication/tokenverifier/NullTokenVerifier')

const { createSignInServiceStub, createPrisonerServiceStub, createLicenceServiceStub } = require('./mockServices')
const standardRouter = require('../server/routes/routeWorkers/standardRouter')
const { GotenbergClient } = require('../server/data/gotenbergClient')
const { links } = require('../server/config')

function testFormPageGets(app, routes, licenceServiceStub) {
  describe('licence exists for bookingId', () => {
    routes.forEach((route) => {
      test(`renders the ${route.url} page`, () => {
        return request(app)
          .get(route.url)
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            expect(res.text).toContain(route.content)
          })
      })
    })
  })

  describe('licence doesnt exists for bookingId', () => {
    beforeEach(() => {
      licenceServiceStub.getLicence.mockResolvedValue(null)
    })
    routes.forEach((route) => {
      test(`renders the ${route.url} page`, () => {
        return request(app)
          .get(route.url)
          .expect(302)
          .expect((res) => {
            expect(res.header.location).toBe('/')
          })
      })
    })
  })
}

const users = {
  caUser: {
    name: 'ca last',
    token: 'token',
    role: 'CA',
    username: 'CA_USER_TEST',
    activeCaseLoad: {
      caseLoadId: 'caseLoadId',
      description: '---',
    },
    activeCaseLoadId: 'caseLoadId',
    isPrisonUser: true,
  },
  roUser: {
    name: 'ro last',
    username: 'RO_USER',
    token: 'token',
    role: 'RO',
    isPrisonUser: false,
  },
  nomisRoUser: {
    name: 'ro last',
    username: 'NOMIS_RO_USER',
    token: 'token',
    role: 'RO',
    isPrisonUser: true,
  },
  dmUser: {
    name: 'dm last',
    username: 'DM_USER',
    token: 'token',
    role: 'DM',
    isPrisonUser: true,
  },
  batchUser: {
    name: 'nb last',
    username: 'NOMIS_BATCHLOAD',
    token: 'token',
    role: 'BATCHLOAD',
    isPrisonUser: true,
  },
  authBatchUser: {
    name: 'nb last',
    username: 'AUTH_BATCHLOAD',
    token: 'token',
    role: 'BATCHLOAD',
    isPrisonUser: false,
  },
}
const appSetup = (route, user = 'caUser', prefix = '', flash = jest.fn().mockReturnValue([])) => {
  const app = express()

  app.locals.feedbackAndSupportUrl = links.feedbackAndSupportUrl

  app.set('views', path.join(__dirname, '../server/views'))
  app.set('view engine', 'pug')

  const userObj = users[user]
  app.use((req, res, next) => {
    req.user = userObj
    req.flash = flash
    res.locals.user = userObj
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(pdfRenderer(new GotenbergClient('http://localhost:3001')))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(prefix, route)
  app.use((error, req, res, next) => {
    if (error.status !== 403) {
      // eslint-disable-next-line no-console
      console.log('an error occurred:', error)
    }
    next(error)
  })

  return app
}

const startRoute = (
  route,
  urlPath,
  user,
  auditKey,
  config,
  audit = mockAudit(),
  flash = jest.fn().mockReturnValue([])
) => {
  const signInService = createSignInServiceStub()
  const prisonerService = createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config,
  })
  const builtRoute = baseRouter(route, { auditKey })
  return appSetup(builtRoute, user, urlPath, flash)
}

module.exports = {
  testFormPageGets,
  users,
  appSetup,
  startRoute,
}
