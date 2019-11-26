const request = require('supertest')
const {
  createLicenceServiceStub,
  createPrisonerServiceStub,
  appSetup,
  auditStub,
  createSignInServiceStub,
  users,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/send')
const transitionsForDestinations = require('../../server/services/notifications/transitionsForDestinations')

describe('send', () => {
  let notificationService
  let prisonerService

  const prisoner = { firstName: 'first', lastName: 'last', dateOfBirth: 'off-dob', offenderNo: 'AB1234A' }
  const submissionTarget = { premise: 'HMP Blah', agencyId: 'LT1', name: 'Something', deliusId: 'delius' }

  beforeEach(() => {
    prisonerService = createPrisonerServiceStub()
    prisonerService.getOrganisationContactDetails = sinon.stub().resolves(submissionTarget)

    prisonerService.getEstablishmentForPrisoner = sinon
      .stub()
      .resolves({ premise: 'HMP Blah', com: { name: 'Something' } })

    prisonerService.getPrisonerPersonalDetails = sinon.stub().resolves(prisoner)

    notificationService = {
      send: sinon.stub().resolves({}),
    }
  })

  describe('Get send/:destination/:bookingId', () => {
    it('renders caToRo form when addressReview is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/addressReview/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToRo">')
        })
    })

    it('renders caToRo form when bassReview is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/bassReview/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToRo">')
        })
    })

    it('renders roToCa form when finalChecks is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'roUser')
      return request(app)
        .get('/hdc/send/finalChecks/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="roToCa">')
        })
    })

    it('renders caToDm form when approval is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/approval/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToDm">')
        })
    })

    it('renders dmToCa form when decided is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'dmUser')
      return request(app)
        .get('/hdc/send/decided/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="dmToCa">')
        })
    })

    it('renders caToDmRefusal form when refusal is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/refusal/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToDmRefusal">')
        })
    })

    it('renders dmToCaReturn form when return is destination', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'dmUser')
      return request(app)
        .get('/hdc/send/return/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="dmToCaReturn">')
        })
    })

    it('gets a submission target for caToRo', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/addressReview/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('name="submissionTarget" value="Something"')
        })
    })

    it('gets a submission target for roToCa', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'roUser')
      return request(app)
        .get('/hdc/send/finalChecks/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('name="submissionTarget" value="HMP Blah"')
        })
    })

    it('should throw if get requested by wrong user', () => {
      const app = createApp({ prisonerServiceStub: prisonerService }, 'roUser')
      return request(app)
        .get('/hdc/send/refusal/123')
        .expect(403)
    })
  })

  describe('POST send/:destination/:bookingId', () => {
    describe('Sending', () => {
      it('ca user sends to ro to review address ', () => {
        const app = createApp({ prisonerServiceStub: prisonerService, notificationServiceStub: notificationService })

        return request(app)
          .post('/hdc/send/addressReview/123')
          .expect(() => {
            expect(notificationService.send).to.be.calledWith({
              bookingId: '123',
              transition: transitionsForDestinations.addressReview,
              licence: { licence: { key: 'value' } },
              prisoner,
              token: 'token',
              user: users.caUser,
            })
          })
      })

      it('ro user requests final checks', () => {
        const app = createApp(
          { prisonerServiceStub: prisonerService, notificationServiceStub: notificationService },
          'roUser'
        )

        return request(app)
          .post('/hdc/send/finalChecks/123')
          .expect(() => {
            expect(notificationService.send).to.be.calledWith({
              bookingId: '123',
              transition: transitionsForDestinations.finalChecks,
              licence: { licence: { key: 'value' } },
              prisoner,
              token: 'system-token',
              user: users.roUser,
            })
          })
      })

      it('dm user returns case to ca', () => {
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
          .expect(res => {
            expect(res.header.location).to.eql('/hdc/sent/CA/dmToCaReturn/123')
            expect(notificationService.send).to.be.calledWith({
              bookingId: '123',
              transition: transitionsForDestinations.return,
              licence: { licence: { key: 'value' } },
              prisoner,
              token: 'token',
              user: users.dmUser,
            })
          })
      })

      it('should throw if post requested by wrong user', () => {
        const app = createApp({ prisonerServiceStub: prisonerService }, 'caUser')

        return request(app)
          .post('/hdc/send/return/123')
          .send({ bookingId: 123, sender: 'from', receiver: 'to', transitionType: 'foobar' })
          .expect(403)
      })
    })
  })
})
function createApp({ prisonerServiceStub, notificationServiceStub }, user) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = createLicenceServiceStub()
  const signInService = createSignInServiceStub()

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
