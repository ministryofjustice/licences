const request = require('supertest')
const { mockAudit } = require('../mockClients')
const getLicenceStatus = require('../../server/utils/licenceStatus')

const { appSetup } = require('../supertestSetup')

const {
  createLicenceServiceStub,
  createPrisonerServiceStub,
  createConditionsServiceStub,
  createSignInServiceStub,
} = require('../mockServices')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/review')

const prisonerService = createPrisonerServiceStub()
const conditionsService = createConditionsServiceStub()
let licenceService

let app

describe('/review/', () => {
  beforeEach(() => {
    licenceService = createLicenceServiceStub()
    prisonerService.getPrisonerDetails = jest.fn().mockReturnValue({})
  })

  const licence = {
    licence: {
      eligibility: {
        proposedAddress: {
          addressLine1: 'line1',
        },
      },
    },
    stage: 'ELIGIBILITY',
  }

  describe('/licence/', () => {
    test('does not show errors when stage not owned by role', () => {
      licenceService.getLicence = jest.fn().mockReturnValue(licence)
      app = createApp('roUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(licenceService.validateFormGroup).not.toHaveBeenCalled()
        })
    })

    test('shows errors when stage owned by role', () => {
      licenceService.getLicence = jest.fn().mockReturnValue(licence)
      app = createApp('caUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(licenceService.validateFormGroup).toHaveBeenCalled()
        })
    })

    test('shows errors when CA in post approval', () => {
      licenceService.getLicence = jest.fn().mockReturnValue({ licence: {}, stage: 'DECIDED' })
      app = createApp('caUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(licenceService.validateFormGroup).toHaveBeenCalled()
        })
    })

    test('Does not show errors in post approval when not CA', () => {
      licenceService.getLicence = jest.fn().mockReturnValue({ licence: {}, stage: 'DECIDED' })
      app = createApp('roUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(licenceService.validateFormGroup).not.toHaveBeenCalled()
        })
    })

    test('Decisions and Tasks used for error checking', () => {
      const emptyLicence = { licence: {}, stage: 'DECIDED' }
      const { decisions, tasks } = getLicenceStatus(emptyLicence)

      licenceService.getLicence = jest.fn().mockReturnValue(emptyLicence)
      app = createApp('caUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(licenceService.validateFormGroup).toHaveBeenCalled()
          expect(licenceService.validateFormGroup).toHaveBeenCalledWith({
            licence: emptyLicence.licence,
            stage: emptyLicence.stage,
            decisions,
            tasks,
          })
        })
    })

    test('calls getPrisonerDetails', () => {
      app = createApp('caUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(prisonerService.getPrisonerDetails).toHaveBeenCalled()
          expect(prisonerService.getPrisonerDetails).toHaveBeenCalledWith('1', 'token')
        })
    })

    test('calls uses system token when logged in as RO setPrisonerDetails', () => {
      app = createApp('roUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(prisonerService.getPrisonerDetails).toHaveBeenCalled()
          expect(prisonerService.getPrisonerDetails).toHaveBeenCalledWith('1', 'system-token')
        })
    })
  })

  describe('/curfewAddress/', () => {
    beforeEach(() => {
      app = createApp('caUser')
      licenceService.getLicence = jest.fn().mockReturnValue(licence)
    })

    test('shows a button to send the case if there are no errors', () => {
      licenceService.validateFormGroup = jest.fn().mockReturnValue({})

      return request(app)
        .get('/hdc/review/curfewAddress/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('The case is ready to send to the responsible officer for address checks')
          expect(res.text).not.toContain('class="error-summary"')
        })
    })

    test('shows a link to the address page if there are errors', () => {
      licenceService.validateFormGroup = jest.fn().mockReturnValue({ a: 'b' })

      return request(app)
        .get('/hdc/review/curfewAddress/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toEqual(expect.not.arrayContaining(['href="/hdc/send/']))
          expect(res.text).toContain('errors before continuing')
          expect(res.text).toContain('class="error-summary"')
        })
    })
  })

  describe('/licenceDetails/', () => {
    beforeEach(() => {
      app = createApp('roUser')
      licenceService.getLicence = jest.fn().mockReturnValue(licence)
    })

    test('links to optedOut send page when opted out', () => {
      licenceService.getLicence = jest.fn().mockReturnValue({
        licence: {
          proposedAddress: {
            optOut: { decision: 'Yes' },
          },
        },
        stage: 'PROCESSING_RO',
      })

      return request(app)
        .get('/hdc/review/licenceDetails/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('/hdc/send/optedOut/1')
        })
    })

    test('links to addressRejected send page when address is rejected', () => {
      licenceService.getLicence = jest.fn().mockReturnValue({
        licence: {
          proposedAddress: { curfewAddress: { addressLine1: 'address1' } },
          curfew: { curfewAddressReview: { consent: 'No' } },
        },
        stage: 'PROCESSING_RO',
      })

      return request(app)
        .get('/hdc/review/licenceDetails/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('/hdc/send/addressRejected/1')
        })
    })

    test('links to final checks send page when not opted out and address not rejected', () => {
      licenceService.getLicence = jest.fn().mockReturnValue({
        licence: {
          proposedAddress: {
            curfewAddress: {
              addresses: [{ consent: 'Yes' }],
            },
          },
        },
        stage: 'PROCESSING_RO',
      })

      return request(app)
        .get('/hdc/review/licenceDetails/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('/hdc/send/finalChecks/1')
        })
    })
  })

  describe('/address/', () => {
    beforeEach(() => {
      app = createApp('caUser')
    })

    test('shows an actions panel if in PROCESSING_CA stage', () => {
      licenceService.getLicence = jest.fn().mockReturnValue({
        licence: {
          eligibility: {
            proposedAddress: {
              addressLine1: 'line1',
            },
          },
        },
        stage: 'PROCESSING_CA',
      })

      return request(app)
        .get('/hdc/review/address/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('id="withdrawAddress"')
        })
    })

    test('does not show an actions panel if in ELIGIBILITY stage', () => {
      licenceService.getLicence = jest.fn().mockReturnValue({
        licence: {
          eligibility: {
            proposedAddress: {
              addressLine1: 'line1',
            },
          },
        },
        stage: 'ELIGIBILITY',
      })

      return request(app)
        .get('/hdc/review/address/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toEqual(expect.not.arrayContaining(['id="withdrawAddress"']))
        })
    })
  })
})

function createApp(user) {
  const signInService = createSignInServiceStub()
  const audit = mockAudit()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    config: null,
  })
  const route = baseRouter(createRoute({ licenceService, conditionsService, prisonerService }))

  return appSetup(route, user, '/hdc/review')
}
