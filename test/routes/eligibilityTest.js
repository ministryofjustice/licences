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
const createRoute = require('../../server/routes/eligibility')
const formConfig = require('../../server/routes/config/eligibility')

describe('/hdc/eligibility', () => {
  describe('eligibility routes', () => {
    const routes = [
      { url: '/hdc/eligibility/excluded/1', content: 'statutorily excluded' },
      { url: '/hdc/eligibility/suitability/1', content: 'presumed unsuitable' },
      { url: '/hdc/eligibility/crdTime/1', content: '4 weeks to the conditional release date?' },
    ]
    const licenceService = createLicenceServiceStub()
    const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

    testFormPageGets(app, routes, licenceService)
  })

  describe('GET /eligibility/excluded/:bookingId', () => {
    it('does not pre-populates input if it does not exist on licence', () => {
      const licenceService = createLicenceServiceStub()
      const app = createApp({ licenceServiceStub: licenceService })

      return request(app)
        .get('/hdc/eligibility/excluded/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input id="excludedYes" type="radio" name="decision" value="Yes">')
          expect(res.text).to.not.contain('<input id="excludedYes" type="radio" checked name="decision" value="Yes">')
        })
    })

    it('pre-populates input if it exists on licence', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = sinon.stub().resolves({
        licence: {
          eligibility: {
            excluded: {
              decision: 'Yes',
              reason: ['sexOffenderRegister', 'convictedSexOffences'],
            },
          },
        },
      })
      const app = createApp({ licenceServiceStub: licenceService })

      return request(app)
        .get('/hdc/eligibility/excluded/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('value="sexOffenderRegister" checked')
          expect(res.text).to.contain('value="convictedSexOffences" checked')
        })
    })
  })

  describe('POST /hdc/eligibility/:form/:bookingId', () => {
    const routes = [
      {
        url: '/hdc/eligibility/excluded/1',
        body: { decision: 'No' },
        section: 'excluded',
        nextPath: '/hdc/eligibility/suitability/1',
        user: 'caUser',
      },
      {
        url: '/hdc/eligibility/excluded/1',
        body: { decision: 'Yes' },
        section: 'excluded',
        nextPath: '/hdc/taskList/1',
        user: 'caUser',
      },
      {
        url: '/hdc/eligibility/suitability/1',
        body: { decision: 'No' },
        section: 'suitability',
        nextPath: '/hdc/eligibility/crdTime/1',
        user: 'caUser',
      },
      {
        url: '/hdc/eligibility/suitability/1',
        body: { decision: 'Yes' },
        section: 'suitability',
        nextPath: '/hdc/eligibility/exceptionalCircumstances/1',
        user: 'caUser',
      },
      {
        url: '/hdc/eligibility/exceptionalCircumstances/1',
        body: { decision: 'Yes' },
        section: 'exceptionalCircumstances',
        nextPath: '/hdc/eligibility/crdTime/1',
        user: 'caUser',
      },
      {
        url: '/hdc/eligibility/exceptionalCircumstances/1',
        body: { decision: 'No' },
        section: 'exceptionalCircumstances',
        nextPath: '/hdc/taskList/1',
        user: 'caUser',
      },
      {
        url: '/hdc/eligibility/crdTime/1',
        body: { decision: 'Yes' },
        section: 'crdTime',
        nextPath: '/hdc/taskList/1',
        user: 'caUser',
      },
      {
        url: '/hdc/eligibility/crdTime/1',
        body: { decision: 'No' },
        section: 'crdTime',
        nextPath: '/hdc/taskList/1',
        user: 'caUser',
      },
    ]

    routes.forEach(route => {
      it(`renders the correct path '${route.nextPath}' page`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.resolves({ eligibility: { [route.section]: {} } })
        const app = createApp({ licenceServiceStub: licenceService }, route.user)

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect('Location', route.nextPath)
          .expect(() => {
            expect(licenceService.update).to.be.calledOnce()
            expect(licenceService.update).to.be.calledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: formConfig[route.section],
              userInput: route.body,
              licenceSection: 'eligibility',
              formName: route.section,
              postRelease: false,
            })
          })
      })

      it('throws an error if logged in as dm', () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'dmUser')

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(403)
      })

      it('throws an error if logged in as ro', () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(403)
      })
    })

    it('should redirect back to excluded page if there is an error in the submission', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.update.resolves({ eligibility: { excluded: {} } })
      licenceService.validateForm = sinon.stub().returns({ reason: 'error' })
      const app = createApp({ licenceServiceStub: licenceService })

      return request(app)
        .post('/hdc/eligibility/excluded/1')
        .send({})
        .expect(302)
        .expect('Location', '/hdc/eligibility/excluded/1')
    })

    it('should redirect back to suitability page if there is an error in the submission', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.update.resolves({ eligibility: { suitability: {} } })
      licenceService.validateForm = sinon.stub().returns({ reason: 'error' })
      const app = createApp({ licenceServiceStub: licenceService })

      return request(app)
        .post('/hdc/eligibility/suitability/1')
        .send({})
        .expect(302)
        .expect('Location', '/hdc/eligibility/suitability/1')
    })

    it('should redirect back to crdtime page if there is an error in the submission', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.update.resolves({ eligibility: { crdTime: {} } })
      licenceService.validateForm = sinon.stub().returns({ reason: 'error' })
      const app = createApp({ licenceServiceStub: licenceService })

      return request(app)
        .post('/hdc/eligibility/crdTime/1')
        .send({})
        .expect(302)
        .expect('Location', '/hdc/eligibility/crdTime/1')
    })

    it('should redirect back to exceptions circumstances page if there is an error in the submission', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.update.resolves({ eligibility: { exceptionalCircumstances: {} } })
      licenceService.validateForm = sinon.stub().returns({ reason: 'error' })
      const app = createApp({ licenceServiceStub: licenceService })

      return request(app)
        .post('/hdc/eligibility/exceptionalCircumstances/1')
        .send({})
        .expect(302)
        .expect('Location', '/hdc/eligibility/exceptionalCircumstances/1')
    })
  })

  describe('push to nomis', () => {
    const specs = [
      {
        type: 'excluded',
        path: '/hdc/eligibility/excluded/1',
        data: { eligibility: { excluded: { decision: 'ABC', reason: 'XYZ' } } },
      },
      {
        type: 'exceptionalCircumstances',
        path: '/hdc/eligibility/exceptionalCircumstances/1',
        data: { eligibility: { exceptionalCircumstances: { decision: 'ABC' }, suitability: { reason: 'XYZ' } } },
      },
    ]

    specs.forEach(spec => {
      it(`should push ${spec.type} status to nomis`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.resolves(spec.data)
        const nomisPushService = createNomisPushServiceStub()
        const app = createApp(
          {
            licenceServiceStub: licenceService,
            nomisPushServiceStub: nomisPushService,
          },
          'caUser',
          { pushToNomis: true }
        )

        return request(app)
          .post(spec.path)
          .send({ decision: 'Yes' })
          .expect(302)
          .expect(() => {
            expect(nomisPushService.pushStatus).to.be.calledOnce()
            expect(nomisPushService.pushStatus).to.be.calledWith(
              '1',
              { type: spec.type, status: 'ABC', reason: 'XYZ' },
              'CA_USER_TEST'
            )
          })
      })
    })
  })

  it('should not push the postponement to nomis if config variable is false', () => {
    const licenceService = createLicenceServiceStub()
    licenceService.update.resolves({
      eligibility: { excluded: { decision: 'ABC', reason: 'XYZ' } },
    })
    const nomisPushService = createNomisPushServiceStub()
    const app = createApp(
      {
        licenceServiceStub: licenceService,
        nomisPushServiceStub: nomisPushService,
      },
      'caUser',
      { pushToNomis: false }
    )

    return request(app)
      .post('/hdc/eligibility/excluded/1')
      .send({ decision: 'Yes' })
      .expect(302)
      .expect(() => {
        expect(nomisPushService.pushStatus).to.not.be.called()
      })
  })
})

function createApp({ licenceServiceStub, nomisPushServiceStub }, user, config = {}) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const nomisPushService = nomisPushServiceStub || createNomisPushServiceStub()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    authenticationMiddleware,
    audit: auditStub,
    signInService,
    config,
  })
  const route = baseRouter(createRoute({ licenceService, nomisPushService }))

  return appSetup(route, user, '/hdc/eligibility')
}
