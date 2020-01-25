const request = require('supertest')

const {
  auditStub,
  createPrisonerServiceStub,
  createLicenceServiceStub,
  appSetup,
  createSignInServiceStub,
} = require('../../supertestSetup')

const standardRouter = require('../../../server/routes/routeWorkers/standardRouter')
const createAdminRoute = require('../../../server/routes/admin/licence')

describe('/licences/', () => {
  describe('GET licence', () => {
    test('Renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licences/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Licence details')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app)
        .get('/admin/licences/1')
        .expect(403)
    })
  })

  function createApp(user) {
    const prisonerService = createPrisonerServiceStub()
    const licenceService = createLicenceServiceStub()
    const signInService = createSignInServiceStub()
    const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService })
    const route = baseRouter(createAdminRoute(licenceService, signInService, prisonerService))
    return appSetup(route, user, '/admin/licences')
  }
})
