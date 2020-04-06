const request = require('supertest')
const {
  createLicenceServiceStub,
  createPrisonerServiceStub,
  appSetup,
  auditStub,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/send')

describe('send', () => {
  let notificationService
  let prisonerService

  describe('Get send/resubmit/:bookingId', () => {
    test('Displays correct page title when HDC refused', () => {
      const licence = {
        approval: {
          release: { decision: 'No' },
        },
      }
      const app = createApp(
        {
          prisonerServiceStub: prisonerService,
          notificationServiceStub: notificationService,
        },
        'caUser',
        'DECIDED',
        licence
      )

      return request(app)
        .get('/hdc/send/resubmit/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Submit for reconsideration')
          expect(res.text).toContain('The case is ready to be submitted for reconsideration by the decision maker.')
        })
    })

    test('Displays correct page title when HDC approved', () => {
      const licence = {
        approval: {
          release: { decision: 'Yes' },
        },
      }
      const app = createApp(
        {
          prisonerServiceStub: prisonerService,
          notificationServiceStub: notificationService,
        },
        'caUser',
        'DECIDED',
        licence
      )

      return request(app)
        .get('/hdc/send/resubmit/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Submit for reconsideration')
          expect(res.text).toContain('The case is ready to be submitted for reconsideration by the decision maker.')
        })
    })

    test('Displays correct page title when not DM not yet made a decision', () => {
      const licence = { approval: undefined }
      const app = createApp(
        {
          prisonerServiceStub: prisonerService,
          notificationServiceStub: notificationService,
        },
        'caUser',
        'PROCESSING_CA',
        licence
      )

      return request(app)
        .get('/hdc/send/approval/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Submit for approval')
        })
    })
  })
})

function createApp({ prisonerServiceStub, notificationServiceStub }, user, stage, licence) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const signInService = createSignInServiceStub()

  licenceService.getLicence.mockResolvedValue({
    versionDetails: { version: 1 },
    approvedVersionDetails: { template: 'hdc_ap' },
    stage,
    licence,
  })

  const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService })
  const route = baseRouter(
    createRoute({
      licenceService,
      prisonerService,
      notificationService: notificationServiceStub,
      audit: auditStub,
    }),
    'USER_MANAGEMENT'
  )

  return appSetup(route, user, '/hdc/send/')
}
