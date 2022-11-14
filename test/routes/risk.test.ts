import request from 'supertest'
import { mockAudit } from '../mockClients'
import { appSetup, testFormPageGets } from '../supertestSetup'

import { createPrisonerServiceStub, createLicenceServiceStub, createSignInServiceStub } from '../mockServices'

import standardRouter from '../../server/routes/routeWorkers/standardRouter'
import createRoute from '../../server/routes/risk'
import riskConfig from '../../server/routes/config/risk'
import NullTokenVerifier from '../../server/authentication/tokenverifier/NullTokenVerifier'

describe('/hdc/risk', () => {
  let licenceService

  beforeEach(() => {
    licenceService = createLicenceServiceStub()
  })

  describe('risk routes', () => {
    const routes = [{ url: '/hdc/risk/riskManagement/1', content: 'Risk management' }]
    licenceService = createLicenceServiceStub()
    const app = createApp({ licenceService }, 'roUser')

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
        const app = createApp({ licenceService }, 'roUser')
        return request(app)
          .post('/hdc/risk/riskManagement/1')
          .send(formResponse)
          .expect(302)
          .expect(() => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: riskConfig.riskManagement,
              userInput: formResponse,
              licenceSection: 'risk',
              formName: 'riskManagement',
              postRelease: false,
            })
          })
      })

      test('calls updateLicence from licenceService when ca in post approval', () => {
        licenceService.getLicence.mockResolvedValue({ stage: 'DECIDED', licence: { key: 'value' } })
        const app = createApp({ licenceService }, 'caUser')
        return request(app)
          .post('/hdc/risk/riskManagement/1')
          .send(formResponse)
          .expect(302)
          .expect(() => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' }, stage: 'DECIDED' },
              config: riskConfig.riskManagement,
              userInput: formResponse,
              licenceSection: 'risk',
              formName: 'riskManagement',
              postRelease: false,
            })
          })
      })

      test('audits the update event', () => {
        const audit = mockAudit()
        const app = createApp({ licenceService, audit }, 'roUser')

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
        const app = createApp({ licenceService }, 'caUser')
        return request(app).post('/hdc/risk/riskManagement/1').send(formResponse).expect(302)
      })
    })
  })
})

function createApp({ licenceService = null, prisonerService = null, audit = mockAudit() }, user) {
  const prisonerServiceMock = prisonerService || createPrisonerServiceStub()
  const signInService = createSignInServiceStub()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService: prisonerServiceMock,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config: null,
  })
  const route = baseRouter(createRoute({ licenceService }))

  return appSetup(route, user, '/hdc/risk')
}
