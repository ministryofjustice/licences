const request = require('supertest')

const { appSetup } = require('../supertestSetup')
const { mockAudit } = require('../mockClients')

const { createPrisonerServiceStub, createLicenceServiceStub, createSignInServiceStub } = require('../mockServices')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/sent')
const NullTokenVerifier = require('../../server/authentication/tokenverifier/NullTokenVerifier')
const { links } = require('../../server/config').default

describe('GET sent', () => {
  const prisonerService = createPrisonerServiceStub()
  prisonerService.getOrganisationContactDetails = jest
    .fn()
    .mockResolvedValue({ premise: 'HMP Blah', com: { name: 'Something' } })

  let app
  beforeEach(() => {
    app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')
    app.locals.hdcCreationInCvlEnabled = true
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
      .expect((res) => {
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
      .expect((res) => {
        expect(res.text).toContain('Submitted for approval')
      })
  })

  test('renders the sent page for ROtoCA', () => {
    prisonerService.getOrganisationContactDetails.mockResolvedValue({
      premise: 'Moorland Prison',
      city: 'Doncaster',
      locality: 'Brincliffe',
      postCode: 'LI1 5TH',
      phones: { number: '0114 2345232' },
    })

    return request(app)
      .get('/hdc/sent/CA/roToCa/123')
      .expect(200)
      .expect(() => {
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalled()
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalledWith('CA', '123', 'token')
      })
      .expect((res) => {
        expect(res.text).toContain('Case sent')
        expect(res.text).toContain('Moorland Prison')
        expect(res.text).toContain('Doncaster')
        expect(res.text).toContain('Brincliffe')
        expect(res.text).toContain('LI1 5TH')
        expect(res.text).toContain('0114 2345232')
        expect(res.text).toContain(
          `You can create this licence in the <a href="${links.createAndVaryALicenceCreateCaseloadUrl}">create and vary a licence</a> service`
        )
        expect(res.text).toContain('Return to case list')
        expect(res.text.indexOf('0114 2345232')).toBeLessThan(res.text.indexOf('You can create this licence'))
        expect(res.text.indexOf('You can create this licence')).toBeLessThan(res.text.indexOf('Return to case list'))
      })
  })

  test('shows the CVL link when prison contact details are unavailable', () => {
    return request(app)
      .get('/hdc/sent/CA/roToCa/123')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain(
          `<a href="${links.createAndVaryALicenceCreateCaseloadUrl}">create and vary a licence</a>`
        )
      })
  })

  test.each([false, undefined])('hides the CVL message when the creation toggle is %s', (enabled) => {
    app.locals.hdcCreationInCvlEnabled = enabled

    return request(app)
      .get('/hdc/sent/CA/roToCa/123')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain('Case sent')
        expect(res.text).toContain('Return to case list')
        expect(res.text).not.toContain('You can create this licence')
        expect(res.text).not.toContain(links.createAndVaryALicenceCreateCaseloadUrl)
      })
  })

  test.each(['roToCaAddressRejected', 'roToCaOptedOut'])(
    'does not show the CVL creation message for %s',
    (transition) => {
      return request(app)
        .get(`/hdc/sent/CA/${transition}/123`)
        .expect(200)
        .expect((res) => {
          expect(res.text).not.toContain('You can create this licence')
        })
    }
  )

  test('renders the sent page for DMtoCA', () => {
    return request(app)
      .get('/hdc/sent/CA/dmToCa/123')
      .expect(200)
      .expect(() => {
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalled()
        expect(prisonerService.getOrganisationContactDetails).toHaveBeenCalledWith('CA', '123', 'token')
      })
      .expect((res) => {
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
      .expect((res) => {
        expect(res.text).toContain('Submitted for refusal')
      })
  })

  test('bad request error when an invalid transition template type is provided', () => {
    return request(app).get('/hdc/sent/CA/foobar/123').expect(400)
  })

  describe('Get sent/DM/caToDmResubmit/:bookingId', () => {
    test('Displays correct page title', () => {
      const licence = {
        approval: {
          release: { decision: 'No' },
        },
      }
      const appForResubmission = createAppForResubmission(
        {
          prisonerServiceStub: prisonerService,
        },
        'caUser',
        'DECIDED',
        licence
      )

      return request(appForResubmission)
        .get('/hdc/sent/DM/caToDmResubmit/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Submitted for reconsideration')
        })
    })
  })
})

function createApp({ licenceServiceStub = null, prisonerServiceStub = null }, user) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
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
  const route = baseRouter(createRoute({ prisonerService }))

  const app = appSetup(route, user, '/hdc/sent/')
  app.locals.createAndVaryALicenceCreateCaseloadUrl = links.createAndVaryALicenceCreateCaseloadUrl
  return app
}

function createAppForResubmission({ prisonerServiceStub }, user, stage, licence) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const audit = mockAudit()

  licenceService.getLicence.mockResolvedValue({
    versionDetails: { version: 1 },
    approvedVersionDetails: { template: 'hdc_ap' },
    stage,
    licence,
  })

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config: null,
  })
  const route = baseRouter(
    createRoute({
      prisonerService,
    })
  )
  return appSetup(route, user, '/hdc/sent/')
}
