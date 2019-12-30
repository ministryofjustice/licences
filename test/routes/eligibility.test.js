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
    test('does not pre-populates input if it does not exist on licence', () => {
      const licenceService = createLicenceServiceStub()
      const app = createApp({ licenceServiceStub: licenceService })

      return request(app)
        .get('/hdc/eligibility/excluded/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('<input id="excludedYes" type="radio" name="decision" value="Yes">')
          expect(res.text).not.toContain('<input id="excludedYes" type="radio" checked name="decision" value="Yes">')
        })
    })

    test('pre-populates input if it exists on licence', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.getLicence = jest.fn().mockReturnValue({
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
          expect(res.text).toContain('value="sexOffenderRegister" checked')
          expect(res.text).toContain('value="convictedSexOffences" checked')
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
      test(`renders the correct path '${route.nextPath}' page`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ eligibility: { [route.section]: {} } })
        const app = createApp({ licenceServiceStub: licenceService }, route.user)

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect('Location', route.nextPath)
          .expect(() => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
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

      test('throws an error if logged in as dm', () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'dmUser')

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(403)
      })

      test('throws an error if logged in as ro', () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(403)
      })
    })

    test('should redirect back to excluded page if there is an error in the submission', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.update.mockResolvedValue({ eligibility: { excluded: {} } })
      licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
      const app = createApp({ licenceServiceStub: licenceService })

      return request(app)
        .post('/hdc/eligibility/excluded/1')
        .send({})
        .expect(302)
        .expect('Location', '/hdc/eligibility/excluded/1')
    })

    test('should redirect back to suitability page if there is an error in the submission', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.update.mockResolvedValue({ eligibility: { suitability: {} } })
      licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
      const app = createApp({ licenceServiceStub: licenceService })

      return request(app)
        .post('/hdc/eligibility/suitability/1')
        .send({})
        .expect(302)
        .expect('Location', '/hdc/eligibility/suitability/1')
    })

    test('should redirect back to crdtime page if there is an error in the submission', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.update.mockResolvedValue({ eligibility: { crdTime: {} } })
      licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
      const app = createApp({ licenceServiceStub: licenceService })

      return request(app)
        .post('/hdc/eligibility/crdTime/1')
        .send({})
        .expect(302)
        .expect('Location', '/hdc/eligibility/crdTime/1')
    })

    test('should redirect back to exceptions circumstances page if there is an error in the submission', () => {
      const licenceService = createLicenceServiceStub()
      licenceService.update.mockResolvedValue({ eligibility: { exceptionalCircumstances: {} } })
      licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
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
      test(`should push ${spec.type} status to nomis`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue(spec.data)
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
            expect(nomisPushService.pushStatus).toHaveBeenCalled()
            expect(nomisPushService.pushStatus).toHaveBeenCalledWith({
              bookingId: '1',
              data: { type: spec.type, status: 'ABC', reason: 'XYZ' },
              username: 'CA_USER_TEST',
            })
          })
      })
    })
  })

  test('should not push the postponement to nomis if config variable is false', () => {
    const licenceService = createLicenceServiceStub()
    licenceService.update.mockResolvedValue({
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
        expect(nomisPushService.pushStatus).not.toHaveBeenCalled()
      })
  })

  describe('pushChecksPassed', () => {
    test('should not send to nomisPushService if main config off', async () => {
      const nomisPushService = createNomisPushServiceStub()
      const licenceService = createLicenceServiceStub()
      const licence = { eligibility: {} }
      licenceService.update.mockResolvedValue(licence)

      const app = createApp(
        {
          licenceServiceStub: licenceService,
          nomisPushServiceStub: nomisPushService,
        },
        'caUser',
        { pushToNomis: false }
      )

      return request(app)
        .post('/hdc/eligibility/suitability/1')
        .send({ decision: 'Yes' })
        .expect(302)
        .expect(() => {
          expect(nomisPushService.pushChecksPassed).not.toHaveBeenCalled()
        })
    })

    const checksFailedExamples = [
      {
        type: 'unsuitable',
        licence: { eligibility: { suitability: { decision: 'Yes' } } },
      },
      {
        type: 'excluded',
        licence: { eligibility: { excluded: { decision: 'Yes' } } },
      },
      {
        type: ' excluded not answered',
        licence: { eligibility: { excluded: {}, suitability: { decision: 'No' } } },
      },
      {
        type: ' suitability not answered',
        licence: { eligibility: { excluded: { decision: 'No' }, suitability: {} } },
      },
    ]

    checksFailedExamples.forEach(example => {
      test(`should NOT send to nomisPushService when  ${example.type}`, async () => {
        const nomisPushService = createNomisPushServiceStub()
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue(example.licence)

        const app = createApp(
          {
            licenceServiceStub: licenceService,
            nomisPushServiceStub: nomisPushService,
          },
          'caUser',
          { pushToNomis: true }
        )

        return request(app)
          .post('/hdc/eligibility/suitability/1')
          .send({ decision: 'Yes' })
          .expect(302)
          .expect(() => {
            expect(nomisPushService.pushChecksPassed).not.toHaveBeenCalled()
          })
      })
    })

    test('should NOT send to nomisPushService when suitable but on different form', async () => {
      const licence = {
        eligibility: {
          excluded: {
            decision: 'No',
          },
          suitability: {
            decision: 'No',
          },
        },
      }
      const nomisPushService = createNomisPushServiceStub()
      const licenceService = createLicenceServiceStub()
      licenceService.update.mockResolvedValue(licence)

      const app = createApp(
        {
          licenceServiceStub: licenceService,
          nomisPushServiceStub: nomisPushService,
        },
        'caUser',
        { pushToNomis: true }
      )

      return request(app)
        .post('/hdc/eligibility/excluded/1')
        .send({ decision: 'Yes' })
        .expect(302)
        .expect(() => {
          expect(nomisPushService.pushChecksPassed).not.toHaveBeenCalled()
        })
    })

    test('should send to nomisPushService when checks passed', async () => {
      const licence = { eligibility: { excluded: { decision: 'No' }, suitability: { decision: 'No' } } }
      const nomisPushService = createNomisPushServiceStub()
      const licenceService = createLicenceServiceStub()
      licenceService.update.mockResolvedValue(licence)

      const app = createApp(
        {
          licenceServiceStub: licenceService,
          nomisPushServiceStub: nomisPushService,
        },
        'caUser',
        { pushToNomis: true }
      )

      return request(app)
        .post('/hdc/eligibility/suitability/1')
        .send({ decision: 'Yes' })
        .expect(302)
        .expect(() => {
          expect(nomisPushService.pushChecksPassed).toHaveBeenCalled()
          expect(nomisPushService.pushChecksPassed).toHaveBeenCalledWith({
            bookingId: '1',
            passed: true,
            username: 'CA_USER_TEST',
          })
        })
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
