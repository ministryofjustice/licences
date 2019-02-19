const request = require('supertest')
const { getLicenceStatus } = require('../../server/utils/licenceStatus')

const {
  createLicenceServiceStub,
  createPrisonerServiceStub,
  createConditionsServiceStub,
  authenticationMiddleware,
  appSetup,
  auditStub,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/review')

const prisonerService = createPrisonerServiceStub()
const conditionsService = createConditionsServiceStub()
let licenceService

let app

describe('/review/', () => {
  beforeEach(() => {
    licenceService = createLicenceServiceStub()
    prisonerService.getPrisonerDetails = sinon.stub().resolves({})
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
    it('does not show errors when stage not owned by role', () => {
      licenceService.getLicence = sinon.stub().resolves(licence)
      app = createApp('roUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(licenceService.validateFormGroup).to.not.be.calledOnce()
        })
    })

    it('shows errors when stage owned by role', () => {
      licenceService.getLicence = sinon.stub().resolves(licence)
      app = createApp('caUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(licenceService.validateFormGroup).to.be.calledOnce()
        })
    })

    it('shows errors when CA in post approval', () => {
      licenceService.getLicence = sinon.stub().resolves({ licence: {}, stage: 'DECIDED' })
      app = createApp('caUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(licenceService.validateFormGroup).to.be.calledOnce()
        })
    })

    it('Does not show errors in post approval when not CA', () => {
      licenceService.getLicence = sinon.stub().resolves({ licence: {}, stage: 'DECIDED' })
      app = createApp('roUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(licenceService.validateFormGroup).to.not.be.calledOnce()
        })
    })

    it('Decisions and Tasks used for error checking', () => {
      const emptyLicence = { licence: {}, stage: 'DECIDED' }
      const { decisions, tasks } = getLicenceStatus(emptyLicence)

      licenceService.getLicence = sinon.stub().resolves(emptyLicence)
      app = createApp('caUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(licenceService.validateFormGroup).to.be.calledOnce()
          expect(licenceService.validateFormGroup).to.be.calledWith({
            licence: emptyLicence.licence,
            stage: emptyLicence.stage,
            decisions,
            tasks,
          })
        })
    })

    it('calls getPrisonerDetails', () => {
      app = createApp('caUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(prisonerService.getPrisonerDetails).to.be.calledOnce()
          expect(prisonerService.getPrisonerDetails).to.be.calledWith('1', 'token')
        })
    })

    it('calls uses system token when logged in as RO setPrisonerDetails', () => {
      app = createApp('roUser')

      return request(app)
        .get('/hdc/review/licence/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(prisonerService.getPrisonerDetails).to.be.calledOnce()
          expect(prisonerService.getPrisonerDetails).to.be.calledWith('1', 'system-token')
        })
    })
  })

  describe('/curfewAddress/', () => {
    beforeEach(() => {
      app = createApp('caUser')
      licenceService.getLicence = sinon.stub().resolves(licence)
    })

    it('shows a button to send the case if there are no errors', () => {
      licenceService.validateFormGroup = sinon.stub().returns({})

      return request(app)
        .get('/hdc/review/curfewAddress/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('The case is ready to send to the responsible officer for address checks')
          expect(res.text).to.not.contain('class="error-summary"')
        })
    })

    it('shows a link to the address page if there are errors', () => {
      licenceService.validateFormGroup = sinon.stub().returns({ a: 'b' })

      return request(app)
        .get('/hdc/review/curfewAddress/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.not.contain('href="/hdc/send/')
          expect(res.text).to.contain('errors before continuing')
          expect(res.text).to.contain('class="error-summary"')
        })
    })
  })

  describe('/licenceDetails/', () => {
    beforeEach(() => {
      app = createApp('roUser')
      licenceService.getLicence = sinon.stub().resolves(licence)
    })

    it('links to optedOut send page when opted out', () => {
      licenceService.getLicence = sinon.stub().resolves({
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
        .expect(res => {
          expect(res.text).to.contain('/hdc/send/optedOut/1')
        })
    })

    it('links to addressRejected send page when address is rejected', () => {
      licenceService.getLicence = sinon.stub().resolves({
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
        .expect(res => {
          expect(res.text).to.contain('/hdc/send/addressRejected/1')
        })
    })

    it('links to final checks send page when not opted out and address not rejected', () => {
      licenceService.getLicence = sinon.stub().resolves({
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
        .expect(res => {
          expect(res.text).to.contain('/hdc/send/finalChecks/1')
        })
    })
  })

  describe('/address/', () => {
    beforeEach(() => {
      app = createApp('caUser')
    })

    it('shows an actions panel if in PROCESSING_CA stage', () => {
      licenceService.getLicence = sinon.stub().resolves({
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
        .expect(res => {
          expect(res.text).to.contain('id="withdrawAddress"')
        })
    })

    it('does not show an actions panel if in ELIGIBILITY stage', () => {
      licenceService.getLicence = sinon.stub().resolves({
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
        .expect(res => {
          expect(res.text).to.not.contain('id="withdrawAddress"')
        })
    })
  })
})

function createApp(user) {
  const signInService = createSignInServiceStub()
  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    authenticationMiddleware,
    audit: auditStub,
    signInService,
  })
  const route = baseRouter(createRoute({ licenceService, conditionsService, prisonerService }))

  return appSetup(route, user, '/hdc/review')
}
