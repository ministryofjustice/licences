const request = require('supertest')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  authenticationMiddleware,
  auditStub,
  appSetup,
  testFormPageGets,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/victim')
const formConfig = require('../../server/routes/config/victim')

describe('/hdc/victim', () => {
  let licenceService

  beforeEach(() => {
    licenceService = createLicenceServiceStub()
    auditStub.record.mockReset()
  })

  describe('victim liaison routes', () => {
    const routes = [{ url: '/hdc/victim/victimLiaison/1', content: 'Is this a Victim Contact Service ' }]
    licenceService = createLicenceServiceStub()
    const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

    testFormPageGets(app, routes, licenceService)
  })

  describe('POST /victim/:formName/:bookingId', () => {
    const formResponse = {
      bookingId: '1',
      decision: 'Yes',
    }

    describe('When page contains form fields', () => {
      test('calls updateLicence from licenceService', () => {
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
        return request(app)
          .post('/hdc/victim/victimLiaison/1')
          .send(formResponse)
          .expect(302)
          .expect(() => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: formConfig.victimLiaison,
              userInput: formResponse,
              licenceSection: 'victim',
              formName: 'victimLiaison',
              postRelease: false,
            })
          })
      })

      test('calls updateLicence from licenceService when ca in post approval', () => {
        licenceService.getLicence.mockResolvedValue({ stage: 'DECIDED', licence: { key: 'value' } })
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        return request(app)
          .post('/hdc/victim/victimLiaison/1')
          .send(formResponse)
          .expect(302)
          .expect(() => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' }, stage: 'DECIDED' },
              config: formConfig.victimLiaison,
              userInput: formResponse,
              licenceSection: 'victim',
              formName: 'victimLiaison',
              postRelease: false,
            })
          })
      })

      test('audits the update event', () => {
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

        return request(app)
          .post('/hdc/victim/victimLiaison/1')
          .send(formResponse)
          .expect(() => {
            expect(auditStub.record).toHaveBeenCalled()
            expect(auditStub.record).toHaveBeenCalledWith('UPDATE_SECTION', 'RO_USER', {
              path: '/hdc/victim/victimLiaison/1',
              bookingId: '1',
              userInput: {
                decision: 'Yes',
              },
            })
          })
      })

      test('throws when ca not in final checks or post approval', () => {
        licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({ stage: 'ELIGIBILITY', licence: { key: 'value' } })
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        return request(app).post('/hdc/victim/victimLiaison/1').send(formResponse).expect(403)
      })
    })
  })
})

function createApp({ licenceServiceStub }, user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    authenticationMiddleware,
    audit: auditStub,
    signInService,
  })
  const route = baseRouter(createRoute({ licenceService }))

  return appSetup(route, user, '/hdc/victim')
}
