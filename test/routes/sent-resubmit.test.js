const request = require('supertest')
const {
  createLicenceServiceStub,
  createPrisonerServiceStub,
  appSetup,
  auditStub,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/sent')

describe('sent', () => {
  let notificationService
  let prisonerService

  describe('Get sent/DM/caToDmResubmit/:bookingId', () => {
    test('Displays correct page title', () => {
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
        .get('/hdc/sent/DM/caToDmResubmit/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Submitted for reconsideration')
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

  return appSetup(route, user, '/hdc/sent/')
}
