import request from 'supertest'
import { mockAudit } from '../mockClients'
import { appSetup } from '../supertestSetup'

import {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createSignInServiceStub,
  createFormServiceStub,
  createConditionsServiceFactoryStub,
  createConditionsServiceStub,
} from '../mockServices'

import FormService from '../../server/services/formService'

import NullTokenVerifier from '../../server/authentication/tokenverifier/NullTokenVerifier'
import standardRouter from '../../server/routes/routeWorkers/standardRouter'
import createFormsRoute from '../../server/routes/forms'

describe('GET /forms', () => {
  let app
  beforeEach(() => {
    app = createApp('caUser')
  })

  test('gets agency_notification form', () => {
    return request(app)
      .get('/forms/agency_notification/1')
      .expect(200)
      .expect('Content-Type', 'application/pdf')
      .expect('content-length', '82816')
  })
})

function createApp(user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const audit = mockAudit()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config: null,
  })

  const formService = createFormServiceStub()
  const conditionsServiceFactory = createConditionsServiceFactoryStub()
  conditionsServiceFactory.forLicence.mockReturnValue(createConditionsServiceStub())

  const route = baseRouter(createFormsRoute(formService as unknown as FormService, conditionsServiceFactory))

  return appSetup(route, user, '/forms/')
}
