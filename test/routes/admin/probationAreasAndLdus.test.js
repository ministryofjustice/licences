const request = require('supertest')

const {
  auditStub,
  createLduServiceStub,
  appSetup,
  createSignInServiceStub,
  createLicenceServiceStub,
  createPrisonerServiceStub,
} = require('../../supertestSetup')

const standardRouter = require('../../../server/routes/routeWorkers/standardRouter')
const createAdminRoute = require('../../../server/routes/admin/probationAreasAndLdus')

describe('/areas-and-ldus', () => {
  const probationAreas = [
    { code: 'N01', description: 'desc-1' },
    { code: 'N02', description: 'desc-2' },
    { code: 'N03', description: 'desc-3' },
  ]

  const activeLdusInProbationArea = [
    { code: 'LDU-1', description: 'ldu-desc-1', active: true },
    { code: 'LDU-2', description: 'ldu-desc-2', active: false },
    { code: 'LDU-3', description: 'ldu-desc-3', active: true },
  ]

  const activeLdusFromUi = [
    { code: 'LDU-1', description: 'ldu-desc-1' },
    { code: 'LDU-2', description: 'ldu-desc-2' },
    { code: 'LDU-3', description: 'ldu-desc-3' },
  ]

  let lduService

  beforeEach(() => {
    lduService = createLduServiceStub()
    lduService.getAllProbationAreas = jest.fn().mockReturnValue(probationAreas)
    lduService.getLdusForProbationArea = jest.fn().mockReturnValue(activeLdusInProbationArea)
    lduService.updateActiveLdus = jest.fn()
  })

  describe('GET all probation areas', () => {
    test("calls ldu service's getAllProbationAreas method and return JSON array", () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/areas-and-ldus/probation-areas')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(() => {
          expect(lduService.getAllProbationAreas).toHaveBeenCalled()
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app)
        .get('/admin/areas-and-ldus/probation-areas')
        .expect(403)
    })
  })

  describe('GET ldus', () => {
    test("calls ldu service's getLdusForProbationArea method and return JSON array", () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/areas-and-ldus/probation-areas/N02/local-delivery-units')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(() => {
          expect(lduService.getLdusForProbationArea).toHaveBeenCalled()
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app)
        .get('/admin/areas-and-ldus/probation-areas/N02/local-delivery-units')
        .expect(403)
    })
  })

  describe('POST active LDUs', () => {
    test('Audits the acknowledge activating LDU', () => {
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/areas-and-ldus/probation-areas/N01/local-delivery-units/active')
        .send(activeLdusFromUi)
        .expect(302)
        .expect(() => {
          expect(lduService.updateActiveLdus).toHaveBeenCalled()
        })
    })
    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app)
        .post('/admin/areas-and-ldus/probation-areas/N01/local-delivery-units/active')
        .send(activeLdusFromUi)
        .expect(403)
    })
  })

  // utility function used by tests above
  function createApp(user) {
    const signInService = createSignInServiceStub()
    const prisonerService = createPrisonerServiceStub()
    const licenceService = createLicenceServiceStub()

    const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService })
    const route = baseRouter(createAdminRoute(lduService), {
      auditKey: 'ACTIVE_LDUS',
    })

    return appSetup(route, user, '/admin/areas-and-ldus')
  }
})
