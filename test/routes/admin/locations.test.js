const request = require('supertest')

const { startRoute } = require('../../supertestSetup')
const { createLduServiceStub } = require('../../mockServices')

const standardRouter = require('../../../server/routes/routeWorkers/standardRouter')
const createAdminRoute = require('../../../server/routes/admin/locations')

describe('/locations', () => {
  const probationAreas = [
    { code: 'N01', description: 'desc-1' },
    { code: 'N02', description: 'desc-2' },
    { code: 'N03', description: 'desc-3' },
  ]

  const probationArea = {
    code: 'Lon',
    description: 'London',
    ldus: [
      { code: 'LDU-1', description: 'ldu-desc-1', active: true },
      { code: 'LDU-2', description: 'ldu-desc-2', active: false },
      { code: 'LDU-3', description: 'ldu-desc-3', active: true },
    ],
  }

  const probationAreaCode = 'N02'
  const activeLdus = ['LDU-1', 'LDU-3']

  let lduService

  beforeEach(() => {
    lduService = createLduServiceStub()
    lduService.getAllProbationAreas = jest.fn().mockReturnValue(probationAreas)
    lduService.getProbationArea = jest.fn().mockReturnValue(probationArea)
    lduService.updateActiveLdus = jest.fn()
  })

  describe('GET all probation areas', () => {
    test("calls ldu service's getAllProbationAreas method and return JSON array", () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/locations/probation-areas')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(() => {
          expect(lduService.getAllProbationAreas).toHaveBeenCalled()
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/locations/probation-areas').expect(403)
    })
  })

  describe('GET ldus', () => {
    test("calls ldu service's getProbationArea method and return JSON array", () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/locations/probation-areas/N02/local-delivery-units')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(() => {
          expect(lduService.getProbationArea).toHaveBeenCalledWith(probationAreaCode)
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/locations/probation-areas/N02/local-delivery-units').expect(403)
    })
  })

  describe('POST active LDUs', () => {
    test('Audits the acknowledge activating LDU', () => {
      const app = createApp('batchUser')

      return request(app)
        .post('/admin/locations/probation-areas/N02/local-delivery-units')
        .send({ activeLdus })
        .expect(302)
        .expect('Location', '/admin/locations/probation-areas/N02/local-delivery-units')
        .expect(() => {
          expect(lduService.updateActiveLdus).toHaveBeenCalledWith(probationAreaCode, activeLdus)
        })
    })
    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app)
        .post('/admin/locations/probation-areas/N01/local-delivery-units')
        .send({ activeLdus })
        .expect(403)
    })
  })

  const createApp = (user) => startRoute(createAdminRoute(lduService), '/admin/locations', user, 'ACTIVE_LDUS')
})
