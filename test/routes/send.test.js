const request = require('supertest')
const { mockAudit } = require('../mockClients')
const { appSetup, users } = require('../supertestSetup')

const { createLicenceServiceStub, createPrisonerServiceStub, createSignInServiceStub } = require('../mockServices')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/send')
const transitionsForDestinations = require('../../server/services/notifications/transitionsForDestinations')
const NullTokenVerifier = require('../../server/authentication/tokenverifier/NullTokenVerifier')

describe('send', () => {
  let notificationService
  let prisonerService

  const prisoner = { firstName: 'first', lastName: 'last', dateOfBirth: 'off-dob', offenderNo: 'AB1234A' }
  const submissionTarget = { premise: 'HMP Test', agencyId: 'LT1', name: 'Something', deliusId: 'delius' }

  beforeEach(() => {
    prisonerService = createPrisonerServiceStub()
    prisonerService.getOrganisationContactDetails = jest.fn().mockReturnValue(submissionTarget)

    prisonerService.getEstablishmentForPrisoner = jest
      .fn()
      .mockResolvedValue({ premise: 'HMP Blah', com: { name: 'Something' } })

    prisonerService.getPrisonerPersonalDetails = jest.fn().mockReturnValue(prisoner)

    notificationService = {
      send: jest.fn().mockReturnValue({}),
    }
  })

  describe('Get send/:destination/:bookingId', () => {
    test('renders caToRo form when addressReview is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/addressReview/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('<input type="hidden" name="transitionType" value="caToRo">')
        })
    })

    test('renders caToRo form when bassReview is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/bassReview/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('<input type="hidden" name="transitionType" value="caToRo">')
        })
    })

    test('renders roToCa form when finalChecks is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'roUser')
      return request(app)
        .get('/hdc/send/finalChecks/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('<input type="hidden" name="transitionType" value="roToCa">')
        })
    })

    test('renders caToDm form when approval is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/approval/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('<input type="hidden" name="transitionType" value="caToDm">')
        })
    })

    test('renders dmToCa form when decided is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'dmUser')
      return request(app)
        .get('/hdc/send/decided/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('<input type="hidden" name="transitionType" value="dmToCa">')
        })
    })

    test('renders caToDmRefusal form when refusal is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/refusal/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('<input type="hidden" name="transitionType" value="caToDmRefusal">')
        })
    })

    test('renders dmToCaReturn form when return is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'dmUser')
      return request(app)
        .get('/hdc/send/return/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('<input type="hidden" name="transitionType" value="dmToCaReturn">')
        })
    })

    test('gets a submission target for caToRo', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/addressReview/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('name="submissionTarget" value="Something"')
        })
    })

    test('gets a submission target for roToCa', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'roUser')
      return request(app)
        .get('/hdc/send/finalChecks/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('name="submissionTarget" value="HMP Test"')
        })
    })

    test('should throw if get requested by wrong user', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'roUser')
      return request(app).get('/hdc/send/refusal/123').expect(403)
    })
  })

  describe('POST send/:destination/:bookingId', () => {
    describe('Sending', () => {
      test('ca user sends to ro to review address ', () => {
        const app = createApp({ prisonerServiceStub: prisonerService, notificationServiceStub: notificationService })

        return request(app)
          .post('/hdc/send/addressReview/123')
          .expect(() => {
            expect(notificationService.send).toHaveBeenCalledWith({
              bookingId: '123',
              transition: transitionsForDestinations.addressReview,
              licence: { licence: { key: 'value' } },
              prisoner,
              token: 'token',
              user: users.caUser,
            })
          })
      })

      test('ro user requests final checks', () => {
        const app = createApp(
          { prisonerServiceStub: prisonerService, notificationServiceStub: notificationService },
          'roUser'
        )

        return request(app)
          .post('/hdc/send/finalChecks/123')
          .expect(() => {
            expect(notificationService.send).toHaveBeenCalledWith({
              bookingId: '123',
              transition: transitionsForDestinations.finalChecks,
              licence: { licence: { key: 'value' } },
              prisoner,
              token: 'system-token',
              user: users.roUser,
            })
          })
      })

      test('dm user returns case to ca', () => {
        const app = createApp(
          {
            prisonerServiceStub: prisonerService,
            notificationServiceStub: notificationService,
          },
          'dmUser'
        )

        return request(app)
          .post('/hdc/send/return/123')
          .expect(302)
          .expect((res) => {
            expect(res.header.location).toBe('/hdc/sent/CA/dmToCaReturn/123')
            expect(notificationService.send).toHaveBeenCalledWith({
              bookingId: '123',
              transition: transitionsForDestinations.return,
              licence: { licence: { key: 'value' } },
              prisoner,
              token: 'token',
              user: users.dmUser,
            })
          })
      })

      test('should throw if post requested by wrong user', () => {
        const app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')

        return request(app)
          .post('/hdc/send/return/123')
          .send({ bookingId: 123, sender: 'from', receiver: 'to', transitionType: 'foobar' })
          .expect(403)
      })
    })
  })

  describe('Get send/resubmit/:bookingId', () => {
    test('Displays correct page title when HDC refused', () => {
      const licence = {
        approval: {
          release: { decision: 'No' },
        },
      }
      const app = createAppForReconsideration(
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
      const app = createAppForReconsideration(
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
      const app = createAppForReconsideration(
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

function createApp({ prisonerServiceStub = null, notificationServiceStub = null }, user) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const audit = mockAudit()

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config: null,
  })
  const route = baseRouter(
    createRoute({
      prisonerService,
      notificationService: notificationServiceStub,
    })
  )

  return appSetup(route, user, '/hdc/send/')
}

function createAppForReconsideration(
  { prisonerServiceStub = null, notificationServiceStub = null },
  user,
  stage,
  licence
) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const audit = mockAudit()

  licenceService.getLicence.mockResolvedValue({
    versionDetails: { version: 1 },
    approvedVersionDetails: { template: 'hdc_ap' },
    stage,
    licence,
  })

  const baseRouter = standardRouter({
    licenceService,
    prisonerService,
    audit,
    signInService,
    tokenVerifier: new NullTokenVerifier(),
    config: null,
  })
  const route = baseRouter(
    createRoute({
      prisonerService,
      notificationService: notificationServiceStub,
    })
  )

  return appSetup(route, user, '/hdc/send/')
}
