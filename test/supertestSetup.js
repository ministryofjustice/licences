const request = require('supertest')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const flash = require('connect-flash')
const pdfRenderer = require('@ministryofjustice/express-template-to-pdf')
const auth = require('./mockAuthentication')

const { authenticationMiddleware } = auth

const loggerStub = {
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}

const auditStub = {
  record: jest.fn(),
}

const createSignInServiceStub = () => ({
  signIn: jest.fn().mockReturnValue(),
  refresh: jest.fn().mockReturnValue(),
  getClientCredentialsTokens: jest.fn().mockReturnValue({ token: 'system-token' }),
})

const createLicenceServiceStub = () => ({
  getLicence: jest.fn().mockReturnValue({ licence: { key: 'value' } }),
  update: jest.fn().mockReturnValue(),
  updateSection: jest.fn().mockReturnValue(),
  updateLicenceConditions: jest.fn().mockReturnValue(),
  deleteLicenceCondition: jest.fn().mockReturnValue(),
  markForHandover: jest.fn().mockReturnValue(),
  createLicence: jest.fn().mockReturnValue(),
  updateAddress: jest.fn().mockReturnValue(),
  updateAddresses: jest.fn().mockReturnValue(),
  getEligibilityErrors: jest.fn().mockReturnValue(),
  addAddress: jest.fn().mockReturnValue(),
  addSplitDateFields: jest.fn(arg => arg),
  removeDecision: jest.fn().mockReturnValue({}),
  validateForm: jest.fn().mockReturnValue({}),
  validateFormGroup: jest.fn().mockReturnValue({}),
  rejectProposedAddress: jest.fn().mockReturnValue({}),
  reinstateProposedAddress: jest.fn().mockReturnValue({}),
  createLicenceFromFlatInput: jest.fn().mockReturnValue({}),
  addCurfewHoursInput: jest.fn().mockReturnValue({}),
  removePreviousApprovals: jest.fn().mockReturnValue({}),
})

const createLduServiceStub = () => ({
  getAllProbationAreas: () => jest.fn().mockReturnValue([]),
  getLdusForProbationArea: () => jest.fn().mockReturnValue([]),
  updateActiveLdus: () => jest.fn().mockReturnValue(null),
})

const createConditionsServiceStub = () => ({
  getStandardConditions: jest.fn().mockReturnValue(),
  getAdditionalConditions: jest.fn().mockReturnValue(),
  formatConditionInputs: jest.fn().mockReturnValue(),
  populateLicenceWithConditions: jest.fn().mockReturnValue({}),
})

const createPrisonerServiceStub = () => ({
  getOrganisationContactDetails: jest.fn(),
  getEstablishment: jest.fn(),
  getEstablishmentForPrisoner: jest.fn().mockReturnValue(''),
  getPrisonerDetails: jest.fn().mockReturnValue({}),
  getPrisonerImage: jest.fn().mockReturnValue({ image: 'image' }),
  getPrisonerPersonalDetails: jest.fn().mockReturnValue({ firstName: 'fn', lastName: 'ln', dateOfBirth: '1980-01-01' }),
})

const createPdfServiceStub = () => ({
  getPdfLicenceData: jest.fn().mockReturnValue(),
  checkAndTakeSnapshot: jest.fn().mockReturnValue(),
  getPdf: jest.fn().mockReturnValue(),
  generatePdf: jest.fn().mockReturnValue(),
  updateLicenceType: jest.fn().mockReturnValue(),
})

const createFormServiceStub = () => ({
  generatePdf: jest.fn().mockReturnValue(),
})

const createUserAdminServiceStub = () => ({
  getRoUsers: jest.fn().mockReturnValue(),
  getRoUser: jest.fn().mockReturnValue(),
  getRoUserByDeliusId: jest.fn().mockReturnValue({}),
  updateRoUser: jest.fn().mockReturnValue(),
  deleteRoUser: jest.fn().mockReturnValue(),
  addRoUser: jest.fn().mockReturnValue(),
  findRoUsers: jest.fn().mockReturnValue(),
  verifyUserDetails: jest.fn().mockReturnValue(),
})

const createWarningsClientStub = () => ({
  raiseWarning: jest.fn().mockReturnValue(),
  acknowledgeWarnings: jest.fn().mockReturnValue(),
  getOutstandingWarnings: () => jest.fn().mockReturnValue(),
  getAcknowledgedWarnings: () => jest.fn().mockReturnValue(),
})

const createNotificationServiceStub = () => ({
  notify: jest.fn().mockReturnValue(),
  getNotificationData: jest.fn().mockReturnValue(),
})

const caseListServiceStub = {
  getHdcCaseList: jest.fn().mockReturnValue([]),
}

const createNomisPushServiceStub = () => ({
  pushStatus: jest.fn().mockReturnValue(),
  pushChecksPassed: jest.fn().mockReturnValue(),
})

const createCaServiceStub = {
  getReasonForNotContinuing: jest.fn().mockReturnValue([]),
}

function testFormPageGets(app, routes, licenceServiceStub) {
  describe('licence exists for bookingId', () => {
    routes.forEach(route => {
      test(`renders the ${route.url} page`, () => {
        return request(app)
          .get(route.url)
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(res => {
            expect(res.text).toContain(route.content)
          })
      })
    })
  })

  describe('licence doesnt exists for bookingId', () => {
    beforeEach(() => {
      licenceServiceStub.getLicence.mockResolvedValue(null)
    })
    routes.forEach(route => {
      test(`renders the ${route.url} page`, () => {
        return request(app)
          .get(route.url)
          .expect(302)
          .expect(res => {
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
  },
  roUser: {
    name: 'ro last',
    username: 'RO_USER',
    token: 'token',
    role: 'RO',
  },
  dmUser: {
    name: 'dm last',
    username: 'DM_USER',
    token: 'token',
    role: 'DM',
  },
  batchUser: {
    name: 'nb last',
    username: 'NOMIS_BATCHLOAD',
    token: 'token',
    role: 'BATCHLOAD',
  },
}

const setup = {
  loggerStub,
  auditStub,
  createSignInServiceStub,
  createLicenceServiceStub,
  createConditionsServiceStub,
  createPrisonerServiceStub,
  caseListServiceStub,
  createNomisPushServiceStub,
  createPdfServiceStub,
  createFormServiceStub,
  createUserAdminServiceStub,
  createNotificationServiceStub,
  createWarningsClientStub,
  authenticationMiddleware,
  testFormPageGets,
  users,
  createCaServiceStub,
  createLduServiceStub,
  appSetup(route, user = 'caUser', prefix = '') {
    const app = express()

    app.set('views', path.join(__dirname, '../server/views'))
    app.set('view engine', 'pug')

    const userObj = users[user]
    app.use((req, res, next) => {
      req.user = userObj
      res.locals.user = userObj
      next()
    })
    app.use(cookieSession({ keys: [''] }))
    app.use(flash())
    app.use(pdfRenderer())
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
  },
}

module.exports = setup
