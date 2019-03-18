const request = require('supertest')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createUserAdminServiceStub,
  appSetup,
  auditStub,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createContactRoute = require('../../server/routes/contact')

let app

const roUser = {
  first: 'f1',
  last: 'l1',
  organisation: 'o1',
  jobRole: 'j1',
  email: 'e1',
  telephone: 't1',
}

describe('/contact', () => {
  let userAdminService

  beforeEach(() => {
    userAdminService = createUserAdminServiceStub()
    userAdminService.getRoUserByDeliusId.reset()
    userAdminService.getRoUserByDeliusId.resolves(roUser)
    app = createApp({ userAdminServiceStub: userAdminService }, 'caUser')
  })

  describe('GET /ro/deliusUserId', () => {
    it('calls user service and returns html', () => {
      return request(app)
        .get('/contact/ro/RO_USER_ID')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(userAdminService.getRoUserByDeliusId).to.be.calledOnce()
        })
    })

    it('should display the user details', () => {
      return request(app)
        .get('/contact/ro/RO_USER_ID')
        .expect(200)
        .expect(res => {
          expect(res.text).to.contain('f1 l1')
          expect(res.text).to.contain('o1')
          expect(res.text).to.contain('j1')
          expect(res.text).to.contain('e1')
          expect(res.text).to.contain('t1')
        })
    })
  })
})

function createApp({ userAdminServiceStub }, user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const userAdminService = userAdminServiceStub || createUserAdminServiceStub()

  const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService })
  const route = baseRouter(createContactRoute({ userAdminService }))

  return appSetup(route, user, '/contact/')
}
