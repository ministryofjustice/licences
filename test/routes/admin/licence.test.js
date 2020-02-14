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
  let roNotificationHandler
  const licenceService = createLicenceServiceStub()
  const prisonerService = createPrisonerServiceStub()

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
    roNotificationHandler = {
      sendRoEmail: jest.fn(),
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
          expect(res.text).not.toContain('Notify RO of case handover')
        })
    })

    test('Renders notify button when assigned to RO', () => {
      licenceService.getLicence.mockReturnValue({ stage: 'PROCESSING_RO' })
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licences/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Notify RO of case handover')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app)
        .get('/admin/licences/1')
        .expect(403)
    })
  })

  describe('GET raw licence info', () => {
    test('Renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licences/1/raw')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Status:')
          expect(res.text).toContain(`"exclusion": "UNSTARTED"`)
          expect(res.text).toContain('Record:')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app)
        .get('/admin/licences/1/raw')
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

  describe('GET notify Ro', () => {
    test('Renders HTML output', () => {
      prisonerService.getPrisonerDetails.mockReturnValue({ com: { name: 'Bob' } })
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licences/1/notifyRo')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Notify Responsible officer')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app)
        .get('/admin/licences/1/notifyRo')
        .expect(403)
    })
  })

  describe('POST notify Ro', () => {
    test('Renders HTML output', () => {
      prisonerService.getPrisonerDetails.mockReturnValue({ com: { name: 'Bob' } })
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/licences/1/notifyRo')
        .expect(302)
        .expect('Location', '/admin/licences/1')
        .expect(res => {
          expect(roNotificationHandler.sendRoEmail).toHaveBeenCalledWith({
            bookingId: '1',
            token: 'system-token',
            transition: { notificationType: 'RO_NEW', receiver: 'RO', type: 'caToRo' },
            user: { name: 'nb last', role: 'BATCHLOAD', token: 'token', username: 'NOMIS_BATCHLOAD' },
          })
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app)
        .post('/admin/licences/1/notifyRo')
        .expect(403)
    })
  })

  function createApp(user) {
    const signInService = createSignInServiceStub()
    const baseRouter = standardRouter({ licenceService, prisonerService, audit, signInService })
    const route = baseRouter(
      createAdminRoute(licenceService, signInService, prisonerService, audit, roNotificationHandler)
    )
    return appSetup(route, user, '/admin/licences')
  }
})
