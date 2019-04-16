const request = require('supertest')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  authenticationMiddleware,
  auditStub,
  appSetup,
  testFormPageGets,
  createSignInServiceStub,
  createNomisPushServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/approval')
const formConfig = require('../../server/routes/config/approval')

const prisonerInfoResponse = {
  bookingId: 1,
  facialImageId: 2,
  dateOfBirth: '23/12/1971',
  firstName: 'F',
  middleName: 'M',
  lastName: 'L',
  offenderNo: 'noms',
  aliases: 'Alias',
  assignedLivingUnitDesc: 'Loc',
  physicalAttributes: { gender: 'Male' },
  imageId: 'imgId',
  captureDate: '23/11/1971',
  sentenceExpiryDate: '03/12/1985',
}

describe('/hdc/approval', () => {
  let app
  let licenceServiceStub
  let nomisPushServiceStub
  let signInServiceStub

  beforeEach(() => {
    licenceServiceStub = createLicenceServiceStub()
    nomisPushServiceStub = createNomisPushServiceStub()
    signInServiceStub = createSignInServiceStub()
    app = createApp({ licenceServiceStub, nomisPushServiceStub, signInServiceStub }, 'dmUser')
    licenceServiceStub.update.resolves({ approval: { release: { decision: 'Yes' } } })
  })

  describe('approval routes', () => {
    const service = createLicenceServiceStub()
    service.getLicence.resolves({
      stage: 'APPROVAL',
      licence: {
        proposedAddress: { curfewAddress: { addressLine1: 'line1' } },
        curfew: { curfewAddressReview: { consent: 'No' } },
      },
    })
    app = createApp({ licenceServiceStub: service }, 'dmUser')
    const routes = [
      { url: '/hdc/approval/release/1', content: 'Do you approve HDC release for this offender?' },
      { url: '/hdc/approval/refuseReason/1', content: 'HDC refused' },
    ]

    testFormPageGets(app, routes, service)
  })

  describe('GET /approval/routes/:bookingId', () => {
    it('should display the offender details - release', () => {
      return request(app)
        .get('/hdc/approval/release/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('23/12/1971')
        })
    })
    it('should display the offender details - refuseReason', () => {
      return request(app)
        .get('/hdc/approval/refuseReason/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('23/12/1971')
        })
    })

    it('release should throw if requested by non-DM user', () => {
      const caApp = createApp({ licenceServiceStub }, 'caUser')

      return request(caApp)
        .get('/hdc/approval/release/1')
        .expect(403)
    })

    it('refuseReason should throw if requested by non-DM user', () => {
      const caApp = createApp({ licenceServiceStub }, 'caUser')

      return request(caApp)
        .get('/hdc/approval/refuseReason/1')
        .expect(403)
    })
  })

  describe('POST /hdc/approval/:form/:bookingId', () => {
    const routes = [
      {
        url: '/hdc/approval/release/1',
        body: { decision: 'Yes' },
        section: 'release',
        nextPath: '/hdc/send/decided/1',
        formName: 'release',
      },
      {
        url: '/hdc/approval/release/1',
        body: { decision: 'No' },
        section: 'release',
        nextPath: '/hdc/send/decided/1',
        formName: 'release',
      },
      {
        url: '/hdc/approval/refuseReason/1',
        body: { decision: 'No' },
        section: 'release',
        nextPath: '/hdc/send/decided/1',
        formName: 'refuseReason',
      },
    ]

    routes.forEach(route => {
      it(`renders the correct path '${route.nextPath}' page`, () => {
        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect(res => {
            expect(licenceServiceStub.update).to.be.calledOnce()
            expect(licenceServiceStub.update).to.be.calledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: formConfig[route.formName],
              userInput: route.body,
              licenceSection: 'approval',
              formName: route.section,
              postRelease: false,
            })

            expect(res.header.location).to.equal(route.nextPath)
          })
      })

      it('should redirect to same page if errors on input', () => {
        licenceServiceStub.validateForm.returns({ decision: 'Error 1' })

        return request(app)
          .post(route.url)
          .send({})
          .expect(302)
          .expect('Location', route.url)
      })

      it('should throw if submitted by non-DM user', () => {
        const caApp = createApp({ licenceServiceStub }, 'caUser')

        return request(caApp)
          .post(route.url)
          .send({ decision: 'Yes' })
          .expect(403)
      })
    })

    it('should push the decision to nomis if config variable is true', () => {
      licenceServiceStub.update.resolves({ approval: { release: { decision: 'ABC' } } })
      app = createApp({ licenceServiceStub, nomisPushServiceStub }, 'dmUser', {
        pushToNomis: true,
      })
      return request(app)
        .post('/hdc/approval/release/1')
        .send({ decision: 'Yes' })
        .expect(302)
        .expect(() => {
          expect(nomisPushServiceStub.pushStatus).to.be.calledOnce()
          expect(nomisPushServiceStub.pushStatus).to.be.calledWith(
            '1',
            { type: 'release', status: 'ABC', reason: undefined },
            'DM_USER'
          )
        })
    })

    it('should not push the decision to nomis if config variable is false', () => {
      licenceServiceStub.update.resolves({ approval: { release: { decision: 'ABC' } } })
      app = createApp({ licenceServiceStub, nomisPushServiceStub }, 'dmUser', {
        pushToNomis: false,
      })
      return request(app)
        .post('/hdc/approval/release/1')
        .send({ decision: 'Yes' })
        .expect(302)
        .expect(() => {
          expect(nomisPushServiceStub.pushStatus).to.not.be.called()
        })
    })

    it('should throw if submitted by non-DM user case insensitively', () => {
      const caApp = createApp({ licenceServiceStub }, 'caUser')

      return request(caApp)
        .post('/hdc/Approval/refuseReason/1')
        .send({ decision: 'Yes' })
        .expect(403)
    })
  })
})

function createApp({ licenceServiceStub, nomisPushServiceStub, signInServiceStub }, user, config = {}) {
  const prisonerService = createPrisonerServiceStub()
  prisonerService.getPrisonerDetails = sinon.stub().resolves(prisonerInfoResponse)
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const nomisPushService = nomisPushServiceStub || createNomisPushServiceStub()
  const signInService = signInServiceStub || createLicenceServiceStub()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    authenticationMiddleware,
    audit: auditStub,
    signInService,
    config,
  })
  const route = baseRouter(createRoute({ licenceService, prisonerService, nomisPushService, signInService }))

  return appSetup(route, user, '/hdc/approval')
}
