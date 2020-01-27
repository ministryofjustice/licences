const request = require('supertest')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  appSetup,
  createSignInServiceStub,
} = require('../../supertestSetup')

const standardRouter = require('../../../server/routes/routeWorkers/standardRouter')
const createAdminRoute = require('../../../server/routes/admin/licence')

describe('/licences/', () => {
  let audit

  beforeEach(() => {
    audit = {
      getEventsForBooking: jest.fn().mockReturnValue([
        {
          id: 1,
          user: 'BOB',
          action: 'NOTIFY',
          details: { notifications: [{}, {}, {}], notificationType: 'RO_NEW' },
        },
        { id: 2, user: 'BOB', action: 'UPDATE_SECTION', details: { path: '/hdc/aSection/12345' } },
      ]),
      getEvent: jest.fn().mockReturnValue({
        id: 1,
        user: 'BOB',
        action: 'NOTIFY',
        details: { notifications: [{}, {}, {}], notificationType: 'RO_NEW' },
      }),
    }
  })

  describe('GET licence', () => {
    test('Renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licences/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Licence details')
          expect(res.text).toContain(`3 notifications sent of type: 'RO_NEW'`)
          expect(res.text).toContain(`Provided details for 'aSection'`)
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app)
        .get('/admin/licences/1')
        .expect(403)
    })
  })

  describe('GET event', () => {
    test('Renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licences/events/1/raw')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Event details')
          expect(res.text).toContain(`BOB`)
          expect(res.text).toContain(`Notify`)
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app)
        .get('/admin/licences/events/1/raw')
        .expect(403)
    })
  })

  function createApp(user) {
    const prisonerService = createPrisonerServiceStub()
    const licenceService = createLicenceServiceStub()
    const signInService = createSignInServiceStub()
    const baseRouter = standardRouter({ licenceService, prisonerService, audit, signInService })
    const route = baseRouter(createAdminRoute(licenceService, signInService, prisonerService, audit))
    return appSetup(route, user, '/admin/licences')
  }
})
