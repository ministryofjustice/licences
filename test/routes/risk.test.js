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
const createRoute = require('../../server/routes/risk')
const formConfig = require('../../server/routes/config/risk')

describe('/hdc/risk', () => {
  let licenceService

  beforeEach(() => {
    licenceService = createLicenceServiceStub()
    auditStub.record.mockReset()
  })

  describe('risk routes', () => {
    const routes = [{ url: '/hdc/risk/riskManagement/1', content: 'Risk management' }]
    licenceService = createLicenceServiceStub()
    const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

    testFormPageGets(app, routes, licenceService)
  })

  describe('POST /risk/:formName/:bookingId', () => {
    const formResponse = {
      bookingId: '1',
      planningActions: 'Yes',
      planningActionsDetails: 'details',
    }

    describe('When page contains form fields', () => {
      test('calls updateLicence from licenceService', () => {
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')
        return request(app)
          .post('/hdc/risk/riskManagement/1')
          .send(formResponse)
          .expect(302)
          .expect(() => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: formConfig.riskManagement,
              userInput: formResponse,
              licenceSection: 'risk',
              formName: 'riskManagement',
              postRelease: false,
            })
          })
      })

      test('calls updateLicence from licenceService when ca in post approval', () => {
        licenceService.getLicence.mockResolvedValue({ stage: 'DECIDED', licence: { key: 'value' } })
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        return request(app)
          .post('/hdc/risk/riskManagement/1')
          .send(formResponse)
          .expect(302)
          .expect(() => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' }, stage: 'DECIDED' },
              config: formConfig.riskManagement,
              userInput: formResponse,
              licenceSection: 'risk',
              formName: 'riskManagement',
              postRelease: false,
            })
          })
      })

      test('audits the update event', () => {
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

        return request(app)
          .post('/hdc/risk/riskManagement/1')
          .send(formResponse)
          .expect(() => {
            expect(auditStub.record).toHaveBeenCalled()
            expect(auditStub.record).toHaveBeenCalledWith('UPDATE_SECTION', 'RO_USER', {
              bookingId: '1',
              path: '/hdc/risk/riskManagement/1',
              userInput: {
                planningActions: 'Yes',
                planningActionsDetails: 'details',
              },
            })
          })
      })

      test('does not throw when ca not in final checks or post approval', () => {
        licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({ stage: 'ELIGIBILITY', licence: { key: 'value' } })
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
        return request(app)
          .post('/hdc/risk/riskManagement/1')
          .send(formResponse)
          .expect(302)
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

  return appSetup(route, user, '/hdc/risk')
}
