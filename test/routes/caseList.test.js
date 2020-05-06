const request = require('supertest')
const { mockAudit } = require('../mockClients')
const { appSetup } = require('../supertestSetup')

const {
  caseListServiceStub,
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createSignInServiceStub,
} = require('../mockServices')

const caseListResponse = require('../stubs/caseListResponse')

caseListServiceStub.getHdcCaseList.mockResolvedValue(caseListResponse)

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createCaseListRoute = require('../../server/routes/caseList')

describe('GET /caseList', () => {
  let app
  beforeEach(() => {
    app = createApp('caUser')
  })

  test('returns forbidden status if logged in as admin user role', () => {
    app = createApp('batchUser')
    return request(app).get('/caselist/').expect(403)
  })

  test('redirects if accesss /', () => {
    return request(app).get('/caselist/').expect(302).expect('Location', '/caseList/active')
  })

  test('renders the hdc eligible prisoners page', () => {
    return request(app)
      .get('/caselist/active')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect((res) => {
        expect(res.text).toContain('id="hdcEligiblePrisoners">')
        expect(res.text).toContain('href="/" data-qa="exit-to-dps-link"')
      })
  })
})

function createApp(user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const audit = mockAudit()

  const baseRouter = standardRouter({ licenceService, prisonerService, audit, signInService, config: null })
  const route = baseRouter(createCaseListRoute({ caseListService: caseListServiceStub }))

  return appSetup(route, user, '/caselist/')
}
