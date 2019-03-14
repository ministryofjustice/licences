const request = require('supertest')
const sinon = require('sinon')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const flash = require('connect-flash')
const auth = require('./mockAuthentication')

const { authenticationMiddleware } = auth

const loggerStub = {
  debug: sinon.stub(),
  info: sinon.stub(),
  error: sinon.stub(),
}

const auditStub = {
  record: sinon.stub(),
}

const createSignInServiceStub = () => ({
  signIn: sinon.stub().resolves(),
  refresh: sinon.stub().resolves(),
  getClientCredentialsTokens: sinon.stub().resolves({ token: 'system-token' }),
})

const createLicenceServiceStub = () => ({
  getLicence: sinon.stub().resolves({ licence: { key: 'value' } }),
  update: sinon.stub().resolves(),
  updateSection: sinon.stub().resolves(),
  updateLicenceConditions: sinon.stub().resolves(),
  deleteLicenceCondition: sinon.stub().resolves(),
  markForHandover: sinon.stub().resolves(),
  createLicence: sinon.stub().resolves(),
  updateAddress: sinon.stub().resolves(),
  updateAddresses: sinon.stub().resolves(),
  getEligibilityErrors: sinon.stub().returns(),
  addAddress: sinon.stub().resolves(),
  addSplitDateFields: sinon.stub().returnsArg(0),
  removeDecision: sinon.stub().resolves({}),
  validateForm: sinon.stub().returns({}),
  validateFormGroup: sinon.stub().returns({}),
  rejectProposedAddress: sinon.stub().returns({}),
  reinstateProposedAddress: sinon.stub().returns({}),
  createLicenceFromFlatInput: sinon.stub().resolves({}),
  addCurfewHoursInput: sinon.stub().returns({}),
})

const createConditionsServiceStub = () => ({
  getStandardConditions: sinon.stub().resolves(),
  getAdditionalConditions: sinon.stub().resolves(),
  formatConditionInputs: sinon.stub().resolves(),
  populateLicenceWithConditions: sinon.stub().resolves({}),
})

const createPrisonerServiceStub = () => ({
  getEstablishmentForPrisoner: sinon.stub().resolves(),
  getCom: sinon.stub().resolves(),
  getPrisonerDetails: sinon.stub().resolves({}),
  getPrisonerImage: sinon.stub().resolves({ image: 'image' }),
  getPrisonerPersonalDetails: sinon.stub().resolves({ firstName: 'fn', lastName: 'ln', dateOfBirth: '1980-01-01' }),
})

const createPdfServiceStub = () => ({
  getPdfLicenceData: sinon.stub().resolves(),
  getPdf: sinon.stub().resolves(),
  generatePdf: sinon.stub().resolves(),
})

const createUserAdminServiceStub = () => ({
  getRoUsers: sinon.stub().resolves(),
  getRoUser: sinon.stub().resolves(),
  getRoUserByDeliusId: sinon.stub().resolves({}),
  updateRoUser: sinon.stub().resolves(),
  deleteRoUser: sinon.stub().resolves(),
  addRoUser: sinon.stub().resolves(),
  findRoUsers: sinon.stub().resolves(),
  verifyUserDetails: sinon.stub().resolves(),
})

const createNotificationServiceStub = () => ({
  notify: sinon.stub().resolves(),
})

const caseListServiceStub = {
  getHdcCaseList: sinon.stub().resolves([]),
}

const createNomisPushServiceStub = () => ({
  pushStatus: sinon.stub().resolves(),
})

function testFormPageGets(app, routes, licenceServiceStub) {
  context('licence exists for bookingId', () => {
    routes.forEach(route => {
      it(`renders the ${route.url} page`, () => {
        return request(app)
          .get(route.url)
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(res => {
            expect(res.text).to.contain(route.content)
          })
      })
    })
  })

  context('licence doesnt exists for bookingId', () => {
    beforeEach(() => {
      licenceServiceStub.getLicence.resolves(null)
    })
    routes.forEach(route => {
      it(`renders the ${route.url} page`, () => {
        return request(app)
          .get(route.url)
          .expect(302)
          .expect(res => {
            expect(res.header.location).to.equal('/')
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
  createUserAdminServiceStub,
  createNotificationServiceStub,
  authenticationMiddleware,
  testFormPageGets,
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
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(prefix, route)

    return app
  },
}

module.exports = setup
