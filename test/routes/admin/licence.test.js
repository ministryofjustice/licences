const request = require('supertest')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createSignInServiceStub,
  createNomisPushServiceStub,
} = require('../../mockServices')
const { startRoute } = require('../../supertestSetup')

const createAdminRoute = require('../../../server/routes/admin/licence')

describe('/licences/', () => {
  let audit
  let roNotificationHandler
  const licenceService = createLicenceServiceStub()
  const prisonerService = createPrisonerServiceStub()
  const nomisPushService = createNomisPushServiceStub()
  const flash = jest.fn()

  beforeEach(() => {
    flash.mockReset()
    flash.mockReturnValue([])
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
      record: jest.fn(),
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
        .expect((res) => {
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
        .expect((res) => {
          expect(res.text).toContain('Notify COM of case handover')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/licences/1').expect(403)
    })
  })

  describe('GET raw licence info', () => {
    test('Renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licences/1/raw')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Status:')
          expect(res.text).toContain(`"exclusion": "UNSTARTED"`)
          expect(res.text).toContain('Record:')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/licences/1/raw').expect(403)
    })
  })

  describe('GET event', () => {
    test('Renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licences/events/1/raw')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Event details')
          expect(res.text).toContain(`BOB`)
          expect(res.text).toContain(`Notify`)
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/licences/events/1/raw').expect(403)
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
        .expect((res) => {
          expect(res.text).toContain('Notify Community Offender Manager')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/licences/1/notifyRo').expect(403)
    })
  })

  describe('POST notify Ro', () => {
    test('Renders HTML output', () => {
      prisonerService.getPrisonerDetails.mockReturnValue({ offenderNo: 'AB1234A' })
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/licences/1/notifyRo')
        .expect(302)
        .expect('Location', '/admin/licences/1')
        .expect((res) => {
          expect(roNotificationHandler.sendRoEmail).toHaveBeenCalledWith({
            bookingId: '1',
            offenderNo: 'AB1234A',
            token: 'system-token',
            transition: { notificationType: 'RO_NEW', sender: 'CA', receiver: 'RO', type: 'caToRo' },
            user: {
              name: 'nb last',
              role: 'BATCHLOAD',
              token: 'token',
              username: 'NOMIS_BATCHLOAD',
              isPrisonUser: true,
            },
          })
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).post('/admin/licences/1/notifyRo').expect(403)
    })
  })

  describe('GET reset', () => {
    it('should call prisoner service', () => {
      prisonerService.getPrisonerDetails.mockReturnValue({ com: { name: 'Jim' } })
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licences/events/1/reset-licence')
        .expect(200)
        .expect((res) => {
          expect(prisonerService.getPrisonerDetails).toHaveBeenCalledWith('1', 'system-token')
        })
    })

    it('should render errors', () => {
      prisonerService.getPrisonerDetails.mockReturnValue({ com: { name: 'Jim' } })
      flash.mockReturnValue([{ reset: 'some value' }])

      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licences/events/1/reset-licence')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('There is a problem')
        })
    })
    it('should render prisoner name', () => {
      prisonerService.getPrisonerDetails.mockReturnValue({ com: { name: 'Jimmy Smith' } })
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/licences/events/1/reset-licence')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Jimmy Smith')
        })
    })
  })
  describe('POST reset', () => {
    it('should call resetLicence, audit.record and nomis.resetHDC', async () => {
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/licences/events/100/reset-licence')
        .send({ reset: 'Yes' })
        .expect(302)
        .expect('Location', '/admin/licences/100')
        .expect(() => {
          expect(licenceService.resetLicence).toHaveBeenCalledWith('100')
          expect(audit.record).toHaveBeenCalledWith('RESET', 'NOMIS_BATCHLOAD', { bookingId: '100' })
          expect(nomisPushService.resetHDC).toHaveBeenCalledWith('100', 'NOMIS_BATCHLOAD')
        })
    })

    it('should render audit record page', async () => {
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/licences/events/100/reset-licence')
        .send({ reset: 'Yes' })
        .expect(302)
        .expect('Location', '/admin/licences/100')
    })
    it('should redirect back to itself', async () => {
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/licences/events/100/reset-licence')
        .send({ reset: undefined })
        .expect(302)
        .expect('Location', '/admin/licences/events/100/reset-licence')
    })
  })

  const createApp = (user) =>
    startRoute(
      createAdminRoute(
        licenceService,
        createSignInServiceStub(),
        prisonerService,
        audit,
        roNotificationHandler,
        nomisPushService
      ),
      '/admin/licences',
      user,
      'ACTIVE_LDUS',
      undefined,
      undefined,
      flash
    )
})
