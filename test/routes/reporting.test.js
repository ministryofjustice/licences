const request = require('supertest')

const {
  createPrisonerServiceStub,
  createLicenceServiceStub,
  authenticationMiddleware,
  auditStub,
  appSetup,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/reporting')
const formConfig = require('../../server/routes/config/reporting')

describe('/hdc/reporting', () => {
  describe('routes', () => {
    const routes = [
      { url: '/hdc/reporting/reportingInstructions/1', content: 'Reporting instructions' },
      { url: '/hdc/reporting/reportingDate/1', content: 'Enter reporting date and time' },
    ]

    routes.forEach((route) => {
      test(`renders the ${route.url} page`, () => {
        const licenceService = createLicenceServiceStub()
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

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

  describe('POST /hdc/reporting/reportingInstructions/:bookingId', () => {
    const routes = [
      {
        url: '/hdc/reporting/reportingInstructions/1',
        body: { bookingId: 1 },
        section: 'reportingInstructions',
        targetForm: 'reportingInstructions',
        nextPath: '/hdc/taskList/1',
      },
      {
        url: '/hdc/reporting/reportingDate/1',
        body: { bookingId: 1 },
        section: 'reportingDate',
        targetForm: 'reportingInstructions',
        nextPath: '/hdc/pdf/taskList/1',
      },
    ]

    routes.forEach((route) => {
      test(`renders the correct path '${route.nextPath}' page`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ reporting: { [route.section]: {} } })
        const app = createApp({ licenceServiceStub: licenceService }, 'roUser')

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' } },
              config: formConfig[route.section],
              userInput: route.body,
              licenceSection: 'reporting',
              formName: route.targetForm,
              postRelease: false,
            })

            expect(res.header.location).toBe(route.nextPath)
          })
      })

      test(`renders the correct path '${route.nextPath}' page when ca in post approval`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.update.mockResolvedValue({ reporting: { [route.section]: {} } })
        licenceService.getLicence.mockResolvedValue({ stage: 'DECIDED', licence: { key: 'value' } })
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

        return request(app)
          .post(route.url)
          .send(route.body)
          .expect(302)
          .expect((res) => {
            expect(licenceService.update).toHaveBeenCalled()
            expect(licenceService.update).toHaveBeenCalledWith({
              bookingId: '1',
              originalLicence: { licence: { key: 'value' }, stage: 'DECIDED' },
              config: formConfig[route.section],
              userInput: route.body,
              licenceSection: 'reporting',
              formName: route.targetForm,
              postRelease: false,
            })

            expect(res.header.location).toBe(route.nextPath)
          })
      })

      test(`throws when posting to '${route.nextPath}' when ca in non-post approval`, () => {
        const licenceService = createLicenceServiceStub()
        licenceService.getLicence.mockResolvedValue({ stage: 'PROCESSING_RO', licence: { key: 'value' } })
        const app = createApp({ licenceServiceStub: licenceService }, 'caUser')

        return request(app).post(route.url).send(route.body).expect(403)
      })
    })
  })
})

function createApp({ licenceServiceStub }, user) {
  const prisonerService = createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    authenticationMiddleware,
    audit: auditStub,
    signInService,
  })
  const route = baseRouter(createRoute({ licenceService }))

  return appSetup(route, user, '/hdc/reporting')
}
