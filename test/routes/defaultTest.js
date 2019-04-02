const request = require('supertest')
const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const defaultRoute = require('../../server/routes/default')
const {
  appSetup,
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createSignInServiceStub,
  authenticationMiddleware,
  auditStub,
} = require('../supertestSetup')

describe('GET /', () => {
  it('redirects to caselist for normal users', () => {
    const app = createApp('caUser')

    return request(app)
      .get('/')
      .expect(302)
      .expect('Location', '/caseList/active')
  })

  it('redirects to admin for admin users', () => {
    const app = createApp('batchUser')

    return request(app)
      .get('/')
      .expect(302)
      .expect('Location', '/admin/')
  })
})

function createApp(user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const signInService = createSignInServiceStub()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    authenticationMiddleware,
    audit: auditStub,
    signInService,
  })
  const route = baseRouter(defaultRoute())

  return appSetup(route, user, '/')
}
