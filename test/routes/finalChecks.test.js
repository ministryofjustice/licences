const request = require('supertest')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  authenticationMiddleware,
  auditStub,
  appSetup,
  createSignInServiceStub,
  createNomisPushServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/finalChecks')
const formConfig = require('../../server/routes/config/finalChecks')

describe('/hdc/finalChecks', () => {
  describe('routes', () => {
    const routes = [
      { url: '/hdc/finalChecks/seriousOffence/1', content: 'Has the offender committed an offence' },
      { url: '/hdc/finalChecks/onRemand/1', content: 'Is the offender currently on remand ' },
      {
        url: '/hdc/finalChecks/confiscationOrder/1',
        content: 'Is the offender subject to a confiscation order?',
      },
      { url: '/hdc/finalChecks/postpone/1', content: 'Postpone' },
    ]

    routes.forEach((route) => {
      test(`renders the ${route.url} page`, () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .get(route.url)
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            expect(res.text).toContain(route.content)
          })
      })
    })
  })

  describe('POST /hdc/finalChecks/:section/:bookingId', () => {
    const routes = [
      {
        url: '/hdc/finalChecks/seriousOffence/1',
        body: { bookingId: 1 },
        formName: 'seriousOffence',
        nextPath: '/hdc/finalChecks/onRemand/1',
      },
      {
        url: '/hdc/finalChecks/onRemand/1',
        body: { bookingId: 1 },
        formName: 'onRemand',
        nextPath: '/hdc/finalChecks/confiscationOrder/1',
      },
      {
        url: '/hdc/finalChecks/confiscationOrder/1',
        body: { bookingId: 1 },
        formName: 'confiscationOrder',
        nextPath: '/hdc/taskList/1',
      },
      {
        url: '/hdc/finalChecks/refuse/1',
        body: { bookingId: 1, decision: 'Yes' },
        fieldMap: formConfig.refuse,
        formName: 'refusal',
        nextPath: '/hdc/finalChecks/refusal/1',
      },
      {
        url: '/hdc/finalChecks/refuse/1',
        body: { bookingId: 1, decision: 'No' },
        fieldMap: formConfig.refuse,
        formName: 'refusal',
        nextPath: '/hdc/taskList/1',
      },
      {
        url: '/hdc/finalChecks/refusal/1',
        body: { bookingId: 1, reason: 'something', outOfTimeReasons: [] },
        fieldMap: formConfig.refusal,
        formName: 'refusal',
        nextPath: '/hdc/taskList/1',
      },
      {
        url: '/hdc/finalChecks/postpone/1',
        body: { bookingId: 1, decision: 'Yes', postponeReason: 'something' },
        fieldMap: formConfig.postpone,
        formName: 'postpone',
        nextPath: '/hdc/taskList/1',
      },
    ]

    routes.forEach((route) => {
      test(`renders the correct path '${route.nextPath}' page`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ finalChecks: { [route.formName]: {} } })
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: route.fieldMap || formConfig[route.formName],
              userInput: route.body,
              licenceSection: route.sectionName || 'finalChecks',
              formName: route.formName,
              postRelease: false,
            })

            expect(res.header.location).toBe(route.nextPath)
          })
      })

      test('throws an error if logged in as ro', () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

        return request(app).post(route.url).send(route.body).expect(403)
      })
    })

    describe('when there are errors', () => {
      test('should redirect back to seriousOffence page if there is an error', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ finalChecks: { seriousOffence: {} } })
        licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .post('/hdc/finalChecks/seriousOffence/1')
          .send({})
          .expect(302)
          .expect('Location', '/hdc/finalChecks/seriousOffence/1')
      })

      test('should redirect back to onRemand page if there is an error', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ finalChecks: { onRemand: {} } })
        licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .post('/hdc/finalChecks/onRemand/1')
          .send({})
          .expect(302)
          .expect('Location', '/hdc/finalChecks/onRemand/1')
      })

      test('should redirect back to confiscationOrder page if there is an error', () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ finalChecks: { confiscationOrder: {} } })
        licenceService.validateForm = jest.fn().mockReturnValue({ reason: 'error' })
        const app = createApp({ licenceServiceStub: licenceService })

        return request(app)
          .post('/hdc/finalChecks/confiscationOrder/1')
          .send({})
          .expect(302)
          .expect('Location', '/hdc/finalChecks/confiscationOrder/1')
      })
    })

    describe('push to nomis', () => {
      const specs = [
        {
          type: 'postpone',
          path: '/hdc/finalChecks/postpone/1',
          data: { finalChecks: { postpone: { decision: 'ABC', postponeReason: 'XYZ' } } },
        },
        {
          type: 'refusal',
          path: '/hdc/finalChecks/refusal/1',
          data: { finalChecks: { refusal: { decision: 'ABC', reason: 'XYZ' } } },
        },
      ]

      specs.forEach((spec) => {
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
        finalChecks: { postpone: { decision: 'ABC', postponeReason: 'XYZ' } },
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
        .post('/hdc/finalChecks/postpone/1')
        .send({ decision: 'Yes' })
        .expect(302)
        .expect(() => {
          expect(nomisPushService.pushStatus).not.toHaveBeenCalled()
        })
    })
  })
})

function createApp({ licenceServiceStub, nomisPushServiceStub }, user, config = {}) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  signInService.getClientCredentialsTokens.mockResolvedValue('new token')
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

  return appSetup(route, user, '/hdc/finalChecks')
}
