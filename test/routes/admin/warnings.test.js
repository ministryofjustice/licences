const request = require('supertest')

const {
  createWarningsClientStub,
  auditStub,
  createPrisonerServiceStub,
  createLicenceServiceStub,
  appSetup,
  createSignInServiceStub,
} = require('../../supertestSetup')

const standardRouter = require('../../../server/routes/routeWorkers/standardRouter')
const createAdminRoute = require('../../../server/routes/admin/warnings')

describe('/warnings', () => {
  let warningsClient

  beforeEach(() => {
    const createWarning = (id) => ({
      id,
      bookingId: id * 10,
      timestamp: new Date(),
      code: `code-${id}`,
      messsage: `message-${id}`,
    })
    warningsClient = createWarningsClientStub()
    warningsClient.getOutstandingWarnings = jest.fn().mockReturnValue([createWarning(1), createWarning(2)])
    warningsClient.getAcknowledgedWarnings = jest.fn().mockReturnValue([createWarning(3), createWarning(4)])
  })

  describe('GET outstanding', () => {
    test('calls user service and renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/warnings/outstanding')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(warningsClient.getOutstandingWarnings).toHaveBeenCalled()
        })
    })

    test('should display current warnings', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/warnings/outstanding')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('code-1')
          expect(res.text).toContain('code-2')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/warnings/outstanding').expect(403)
    })
  })

  describe('GET Acknowledged', () => {
    test('calls user service and renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/warnings/acknowledged')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(warningsClient.getAcknowledgedWarnings).toHaveBeenCalled()
        })
    })

    test('should display acknowledged warnings', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/warnings/acknowledged')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('code-3')
          expect(res.text).toContain('code-4')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/warnings/acknowledged').expect(403)
    })
  })

  describe('POST Acknowledged', () => {
    test('Audits the acknowledge warnings event', () => {
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/warnings/acknowledge')
        .send({ bookingId: [1, 2, 3] })
        .expect(302)
        .expect('Location', '/admin/warnings/outstanding')
        .expect(() => {
          expect(auditStub.record).toHaveBeenCalled()
          expect(auditStub.record).toHaveBeenCalledWith('WARNINGS', 'NOMIS_BATCHLOAD', {
            bookingId: [1, 2, 3],
            path: '/admin/warnings/acknowledge',
            userInput: {},
          })
        })
    })
    test('calls the service', () => {
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/warnings/acknowledge')
        .send({ bookingId: [1, 2, 3] })
        .expect(302)
        .expect('Location', '/admin/warnings/outstanding')
        .expect(() => {
          expect(warningsClient.acknowledgeWarnings).toHaveBeenCalled()
          expect(warningsClient.acknowledgeWarnings).toHaveBeenCalledWith([1, 2, 3])
        })
    })
  })

  function createApp(user) {
    const prisonerService = createPrisonerServiceStub()
    const licenceService = createLicenceServiceStub()
    const signInService = createSignInServiceStub()
    const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService })
    const route = baseRouter(createAdminRoute(warningsClient), {
      auditKey: 'WARNINGS',
    })

    return appSetup(route, user, '/admin/warnings')
  }
})
