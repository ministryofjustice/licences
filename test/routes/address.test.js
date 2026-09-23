const request = require('supertest')
const { appSetup } = require('../supertestSetup')
const { mockAudit } = require('../mockClients')
const NullTokenVerifier = require('../../server/authentication/tokenverifier/NullTokenVerifier')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  createSignInServiceStub,
  createNomisPushServiceStub,
  createHdcServiceStub,
} = require('../mockServices')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/address')

describe('/hdc/proposedAddress/', () => {
  const licenceService = createLicenceServiceStub()
  licenceService.getLicence.mockResolvedValue({
    licence: {
      proposedAddress: {
        curfewAddress: {},
      },
    },
  })
  const app = createApp({ licenceServiceStub: licenceService }, 'caUser')
  describe('Should render each page', () => {
    test(`rejected/1 renders the "Curfew address rejected" page`, () => {
      return request(app)
        .get('/hdc/proposedAddress/rejected/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Curfew address rejected')
        })
    })
    test(`curfewAddress/1 renders the "Curfew address" page`, () => {
      return request(app)
        .get('/hdc/proposedAddress/curfewAddress/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Proposed curfew address')
        })
    })
    test(`curfewAddress/1 renders "Additional information" text area`, () => {
      return request(app)
        .get('/hdc/proposedAddress/curfewAddress/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Additional information')
          expect(res.text).toContain('additionalInformation')
          expect(res.text).toContain('textarea')
        })
    })
    test(`curfewAddress/1 renders "Additional information" text content`, () => {
      licenceService.getLicence.mockResolvedValue({
        licence: {
          proposedAddress: {
            curfewAddress: {
              additionalInformation: 'info about address',
            },
          },
        },
      })

      return request(app)
        .get('/hdc/proposedAddress/curfewAddress/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('info about address')
        })
    })

    test(`curfewAddressChoice/1 renders the "Curfew address choice" page`, () => {
      return request(app)
        .get('/hdc/proposedAddress/curfewAddressChoice/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Has the offender provided a curfew address?')
        })
    })

    describe('POST curfewAddressChoice', () => {
      test('redirects to curfew address when Address', () => {
        return request(app)
          .post('/hdc/proposedAddress/curfewAddressChoice/1')
          .send({ decision: 'Address' })
          .expect(302)
          .expect('Location', '/hdc/proposedAddress/curfewAddress/1')
      })

      test('redirects to tasklist and posts event when OptOut', () => {
        const hdcService = createHdcServiceStub()
        const nomisPushService = createNomisPushServiceStub()

        licenceService.getLicence.mockResolvedValue({
          licenceId: 1,
          licence: {},
        })

        const testApp = createApp(
          {
            licenceServiceStub: licenceService,
            hdcServiceStub: hdcService,
            nomisPushServiceStub: nomisPushService,
          },
          'caUser'
        )

        return request(testApp)
          .post('/hdc/proposedAddress/curfewAddressChoice/1')
          .send({ decision: 'OptOut' })
          .expect(302)
          .expect('Location', '/hdc/taskList/1')
          .expect(() => {
            expect(hdcService.postOptOutEvent).toHaveBeenCalledWith(1, 1, 'A1234AA', 'CA_USER_TEST','CA_USER_TEST opted out of HDC during initial curfew address task')
            expect(nomisPushService.pushStatus).not.toHaveBeenCalled()
          })
      })

      test('pushes to NOMIS and posts event when OptOut and pushToNomis is true', () => {
        const hdcService = createHdcServiceStub()
        const nomisPushService = createNomisPushServiceStub()
        const testApp = createApp(
          {
            licenceServiceStub: licenceService,
            hdcServiceStub: hdcService,
            nomisPushServiceStub: nomisPushService,
          },
          'caUser',
          { pushToNomis: true }
        )

        return request(testApp)
          .post('/hdc/proposedAddress/curfewAddressChoice/1')
          .send({ decision: 'OptOut' })
          .expect(302)
          .expect('Location', '/hdc/taskList/1')
          .expect(() => {
            expect(hdcService.postOptOutEvent).toHaveBeenCalledWith(1, 1, 'A1234AA', 'CA_USER_TEST', 'CA_USER_TEST opted out of HDC during initial curfew address task')
            expect(nomisPushService.pushStatus).toHaveBeenCalled()
          })
      })
    })
  })
})

function createApp(
  { licenceServiceStub, prisonerServiceStub = null, nomisPushServiceStub = null, hdcServiceStub = null },
  user,
  config = {}
) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const nomisPushService = nomisPushServiceStub || createNomisPushServiceStub()
  const hdcService = hdcServiceStub || createHdcServiceStub()
  const audit = mockAudit()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config,
  })

  const route = baseRouter(createRoute({ licenceService, nomisPushService, hdcService }), {
    auditKey: 'UPDATE_SECTION',
    licenceRequired: true,
  })

  return appSetup(route, user, '/hdc/proposedAddress')
}
