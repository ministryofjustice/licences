const request = require('supertest')
const { mockAudit } = require('../mockClients')
const { appSetup, testFormPageGets } = require('../supertestSetup')

const { createPrisonerServiceStub, createLicenceServiceStub, createSignInServiceStub } = require('../mockServices')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/victim')
const formConfig = require('../../server/routes/config/victim')
const NullTokenVerifier = require('../../server/authentication/tokenverifier/NullTokenVerifier')

describe('/hdc/victim', () => {
  let licenceService

  beforeEach(() => {
    licenceService = createLicenceServiceStub()
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
        const audit = mockAudit()

        const app = createApp({ licenceServiceStub: licenceService, audit }, 'roUser')

        return request(app)
          .post('/hdc/victim/victimLiaison/1')
          .send(formResponse)
          .expect(() => {
            expect(audit.record).toHaveBeenCalled()
            expect(audit.record).toHaveBeenCalledWith('UPDATE_SECTION', 'RO_USER', {
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

function createApp({ licenceServiceStub, audit = mockAudit() }, user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config: null,
  })
  const route = baseRouter(createRoute({ licenceService }))

  return appSetup(route, user, '/hdc/victim')
}
