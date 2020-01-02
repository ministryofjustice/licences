const request = require('supertest')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  appSetup,
  auditStub,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/sent')

describe('GET sent', () => {
  const prisonerService = createPrisonerServiceStub()
  prisonerService.getOrganisationContactDetails = jest
    .fn()
    .mockResolvedValue({ premise: 'HMP Blah', com: { name: 'Something' } })

  let app
  beforeEach(() => {
    app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')
    prisonerService.getOrganisationContactDetails.mockReset()
  })

  test('renders the sent page for CAtoRO', () => {
    return request(app)
      .get('/hdc/sent/RO/caToRo/123')
      .expect(200)
      .expect(() => {
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalled()
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalledWith('RO', '123', 'token')
      })
      .expect(res => {
        expect(res.text).toContain('Case sent')
      })
  })

  test('renders the sent page for CAtoDM', () => {
    return request(app)
      .get('/hdc/sent/DM/caToDm/123')
      .expect(200)
      .expect(() => {
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalled()
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalledWith('DM', '123', 'token')
      })
      .expect(res => {
        expect(res.text).toContain('Submitted for approval')
      })
  })

  test('renders the sent page for ROtoCA', () => {
    return request(app)
      .get('/hdc/sent/CA/roToCa/123')
      .expect(200)
      .expect(() => {
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalled()
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalledWith('CA', '123', 'token')
      })
      .expect(res => {
        expect(res.text).toContain('Case sent')
      })
  })

  test('renders the sent page for DMtoCA', () => {
    return request(app)
      .get('/hdc/sent/CA/dmToCa/123')
      .expect(200)
      .expect(() => {
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalled()
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalledWith('CA', '123', 'token')
      })
      .expect(res => {
        expect(res.text).toContain('Submitted to prison case admin')
      })
  })

  test('renders the sent page for CAtoDMRefusal', () => {
    return request(app)
      .get('/hdc/sent/DM/caToDmRefusal/123')
      .expect(200)
      .expect(() => {
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalled()
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalledWith('DM', '123', 'token')
      })
      .expect(res => {
        expect(res.text).toContain('Submitted for refusal')
      })
  })

  test('errors when an invalid transition type is provided', () => {
    return request(app)
      .get('/hdc/sent/CA/foobar/123')
      .expect(500)
  })
})

function createApp({ licenceServiceStub, prisonerServiceStub }, user) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()

  const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService })
  const route = baseRouter(createRoute({ licenceService, prisonerService }), 'USER_MANAGEMENT')

  return appSetup(route, user, '/hdc/sent/')
}
