const request = require('supertest')
const { mockAudit } = require('../mockClients')
const { appSetup, testFormPageGets } = require('../supertestSetup')

const { createPrisonerServiceStub, createLicenceServiceStub, createSignInServiceStub } = require('../mockServices')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/risk')
const formConfig = require('../../server/routes/config/risk')

describe('/hdc/risk', () => {
  let licenceService

  beforeEach(() => {
    licenceService = createLicenceServiceStub()
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
        const audit = mockAudit()
        const app = createApp({ licenceServiceStub: licenceService, audit }, 'roUser')

        return request(app)
          .post('/hdc/risk/riskManagement/1')
          .send(formResponse)
          .expect(() => {
            expect(audit.record).toHaveBeenCalled()
            expect(audit.record).toHaveBeenCalledWith('UPDATE_SECTION', 'RO_USER', {
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
        return request(app).post('/hdc/risk/riskManagement/1').send(formResponse).expect(302)
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
    config: null,
  })
  const route = baseRouter(createRoute({ licenceService }))

  return appSetup(route, user, '/hdc/risk')
}
