const request = require('supertest')
const {
  createLicenceServiceStub,
  createPrisonerServiceStub,
  createNotificationServiceStub,
  createUserAdminServiceStub,
  appSetup,
  auditStub,
  createSignInServiceStub,
} = require('../supertestSetup')

const standardRouter = require('../../server/routes/routeWorkers/standardRouter')
const createRoute = require('../../server/routes/send')

describe('send', () => {
  let prisonerService
  let licenceService
  let userAdminService
  let notificationService

  const notificationsData = [{ email: 'email1@email.com' }, { email: 'email2@email.com' }]
  const prisonerDetails = { firstName: 'first', lastName: 'last', dateOfBirth: 'off-dob' }
  const submissionTarget = { premise: 'HMP Blah', agencyId: 'LT1', com: { name: 'Something', deliusId: 'delius' } }

  beforeEach(() => {
    licenceService = createLicenceServiceStub()
    prisonerService = createPrisonerServiceStub()
    userAdminService = createUserAdminServiceStub()
    notificationService = createNotificationServiceStub()

    prisonerService.getOrganisationContactDetails = sinon.stub().resolves(submissionTarget)

    prisonerService.getEstablishmentForPrisoner = sinon
      .stub()
      .resolves({ premise: 'HMP Blah', com: { name: 'Something' } })

    prisonerService.getPrisonerDetails = sinon.stub().resolves(prisonerDetails)

    userAdminService.getRoUserByDeliusId = sinon.stub().resolves({ orgEmail: 'expected@email' })

    notificationService.getNotificationData = sinon.stub().resolves(notificationsData)

    auditStub.record.reset()
    notificationService.notify.reset()
  })

  describe('Get send/:destination/:bookingId', () => {
    it('renders caToRo form when addressReview is destination', () => {
      const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/addressReview/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToRo">')
        })
    })

    it('renders caToRo form when bassReview is destination', () => {
      const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/bassReview/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToRo">')
        })
    })

    it('renders roToCa form when finalChecks is destination', () => {
      const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'roUser')
      return request(app)
        .get('/hdc/send/finalChecks/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="roToCa">')
        })
    })

    it('renders caToDm form when approval is destination', () => {
      const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/approval/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToDm">')
        })
    })

    it('renders dmToCa form when decided is destination', () => {
      const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'dmUser')
      return request(app)
        .get('/hdc/send/decided/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="dmToCa">')
        })
    })

    it('renders caToDmRefusal form when refusal is destination', () => {
      const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/refusal/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="caToDmRefusal">')
        })
    })

    it('renders dmToCaReturn form when return is destination', () => {
      const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'dmUser')
      return request(app)
        .get('/hdc/send/return/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('<input type="hidden" name="transitionType" value="dmToCaReturn">')
        })
    })

    it('gets a submission target for caToRo', () => {
      const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'caUser')
      return request(app)
        .get('/hdc/send/addressReview/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('name="submissionTarget" value="Something"')
        })
    })

    it('gets a submission target for roToCa', () => {
      const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'roUser')
      return request(app)
        .get('/hdc/send/finalChecks/123')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.contain('name="submissionTarget" value="HMP Blah"')
        })
    })

    it('should throw if get requested by wrong user', () => {
      const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'roUser')
      return request(app)
        .get('/hdc/send/refusal/123')
        .expect(403)
    })
  })

  describe('POST send/:destination/:bookingId', () => {
    describe('Sending', () => {
      it('calls markForHandover via licenceService for addressReview', () => {
        const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService })

        return request(app)
          .post('/hdc/send/addressReview/123')
          .expect(() => {
            expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce()
            expect(prisonerService.getOrganisationContactDetails).to.be.calledWith('RO', '123', 'token')
            expect(licenceService.markForHandover).to.be.calledOnce()
            expect(licenceService.markForHandover).to.be.calledWith('123', 'caToRo')
          })
      })

      it('uses system token form RO', () => {
        const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'roUser')

        return request(app)
          .post('/hdc/send/finalChecks/123')
          .expect(() => {
            expect(prisonerService.getOrganisationContactDetails).to.be.calledWith('CA', '123', 'system-token')
          })
      })

      it('calls markForHandover via licenceService for finalChecks', () => {
        const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'roUser')

        return request(app)
          .post('/hdc/send/finalChecks/123')
          .expect(() => {
            expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce()
            expect(licenceService.markForHandover).to.be.calledOnce()
            expect(licenceService.markForHandover).to.be.calledWith('123', 'roToCa')
          })
      })

      it('calls markForHandover via licenceService for approval', () => {
        const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'caUser')

        return request(app)
          .post('/hdc/send/approval/123')
          .expect(() => {
            expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce()
            expect(licenceService.markForHandover).to.be.calledOnce()
            expect(licenceService.markForHandover).to.be.calledWith('123', 'caToDm')
          })
      })

      it('calls markForHandover via licenceService for decided', () => {
        const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'dmUser')

        return request(app)
          .post('/hdc/send/decided/123')
          .expect(() => {
            expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce()
            expect(licenceService.markForHandover).to.be.calledOnce()
            expect(licenceService.markForHandover).to.be.calledWith('123', 'dmToCa')
          })
      })

      it('does not removeDecision when sending to decided', () => {
        const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'dmUser')

        return request(app)
          .post('/hdc/send/decided/123')
          .expect(() => {
            expect(licenceService.removeDecision).to.not.be.called()
          })
      })

      it('calls markForHandover via licenceService for refusal', () => {
        const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'caUser')

        return request(app)
          .post('/hdc/send/refusal/123')
          .expect(() => {
            expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce()
            expect(licenceService.markForHandover).to.be.calledOnce()
            expect(licenceService.markForHandover).to.be.calledWith('123', 'caToDmRefusal')
          })
      })

      it('calls markForHandover via licenceService for return', () => {
        const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'dmUser')

        return request(app)
          .post('/hdc/send/return/123')
          .expect(() => {
            expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce()
            expect(licenceService.markForHandover).to.be.calledOnce()
            expect(licenceService.markForHandover).to.be.calledWith('123', 'dmToCaReturn')
          })
      })

      it('calls removeDecision via licenceService for return', () => {
        const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'dmUser')

        return request(app)
          .post('/hdc/send/return/123')
          .expect(() => {
            expect(licenceService.removeDecision).to.be.calledOnce()
            expect(licenceService.removeDecision).to.be.calledWith('123', { licence: { key: 'value' } })
          })
      })

      it('audits the send event', () => {
        const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'dmUser')

        return request(app)
          .post('/hdc/send/return/123')
          .expect(() => {
            expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce()
            expect(auditStub.record).to.be.calledOnce()
            expect(auditStub.record).to.be.calledWith('SEND', 'DM_USER', {
              bookingId: '123',
              transitionType: 'dmToCaReturn',
              submissionTarget: {
                com: { deliusId: 'delius', name: 'Something' },
                premise: 'HMP Blah',
                agencyId: 'LT1',
              },
            })
          })
      })

      it('shows sent confirmation', () => {
        const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'dmUser')

        return request(app)
          .post('/hdc/send/return/123')
          .expect(302)
          .expect(res => {
            expect(res.header.location).to.eql('/hdc/sent/CA/dmToCaReturn/123')
          })
      })

      it('should throw if post requested by wrong user', () => {
        const app = createApp({ licenceServiceStub: licenceService, prisonerServiceStub: prisonerService }, 'caUser')

        return request(app)
          .post('/hdc/send/return/123')
          .send({ bookingId: 123, sender: 'from', receiver: 'to', transitionType: 'foobar' })
          .expect(403)
      })
    })

    describe('Notifications', () => {
      it('Notifies for new RO case', () => {
        const app = createApp(
          {
            licenceServiceStub: licenceService,
            prisonerServiceStub: prisonerService,
            userAdminServiceStub: userAdminService,
            notificationServiceStub: notificationService,
          },
          'caUser'
        )

        return request(app)
          .post('/hdc/send/addressReview/123')
          .expect(() => {
            expect(notificationService.getNotificationData).to.be.calledOnce()
            expect(notificationService.getNotificationData).to.be.calledWith({
              prisonerDetails,
              token: 'token',
              notificationType: 'RO_NEW',
              submissionTarget,
              bookingId: '123',
              sendingUser: sinon.match.any,
            })
            expect(notificationService.notify).to.be.calledOnce()
            expect(notificationService.notify).to.be.calledWith({
              user: 'CA_USER_TEST',
              notificationType: 'RO_NEW',
              bookingId: '123',
              notifications: notificationsData,
            })
          })
      })

      it('Notifies for returned CA case', () => {
        const app = createApp(
          {
            licenceServiceStub: licenceService,
            prisonerServiceStub: prisonerService,
            userAdminServiceStub: userAdminService,
            notificationServiceStub: notificationService,
          },
          'roUser'
        )

        return request(app)
          .post('/hdc/send/finalChecks/123')
          .expect(() => {
            expect(notificationService.getNotificationData).to.be.calledOnce()
            expect(notificationService.getNotificationData).to.be.calledWith({
              prisonerDetails,
              token: 'system-token',
              notificationType: 'CA_RETURN',
              submissionTarget,
              bookingId: '123',
              sendingUser: sinon.match.any,
            })
            expect(notificationService.notify).to.be.calledOnce()
            expect(notificationService.notify).to.be.calledWith({
              user: 'RO_USER',
              notificationType: 'CA_RETURN',
              bookingId: '123',
              notifications: notificationsData,
            })
          })
      })

      it('Notifies for new DM case', () => {
        const app = createApp(
          {
            licenceServiceStub: licenceService,
            prisonerServiceStub: prisonerService,
            userAdminServiceStub: userAdminService,
            notificationServiceStub: notificationService,
          },
          'caUser'
        )

        return request(app)
          .post('/hdc/send/approval/123')
          .expect(() => {
            expect(notificationService.getNotificationData).to.be.calledOnce()
            expect(notificationService.getNotificationData).to.be.calledWith({
              prisonerDetails,
              token: 'token',
              notificationType: 'DM_NEW',
              submissionTarget,
              bookingId: '123',
              sendingUser: sinon.match.any,
            })
            expect(notificationService.notify).to.be.calledOnce()
            expect(notificationService.notify).to.be.calledWith({
              user: 'CA_USER_TEST',
              notificationType: 'DM_NEW',
              bookingId: '123',
              notifications: notificationsData,
            })
          })
      })

      it('Notifies for decided CA case', () => {
        const app = createApp(
          {
            licenceServiceStub: licenceService,
            prisonerServiceStub: prisonerService,
            userAdminServiceStub: userAdminService,
            notificationServiceStub: notificationService,
          },
          'dmUser'
        )

        return request(app)
          .post('/hdc/send/decided/123')
          .expect(() => {
            expect(notificationService.getNotificationData).to.be.calledOnce()
            expect(notificationService.getNotificationData).to.be.calledWith({
              prisonerDetails,
              token: 'token',
              notificationType: 'CA_DECISION',
              submissionTarget,
              bookingId: '123',
              sendingUser: sinon.match.any,
            })
            expect(notificationService.notify).to.be.calledOnce()
            expect(notificationService.notify).to.be.calledWith({
              user: 'DM_USER',
              notificationType: 'CA_DECISION',
              bookingId: '123',
              notifications: notificationsData,
            })
          })
      })
    })
  })
})

function createApp({ licenceServiceStub, prisonerServiceStub, notificationServiceStub, userAdminServiceStub }, user) {
  const prisonerService = prisonerServiceStub || createPrisonerServiceStub()
  const licenceService = licenceServiceStub || createLicenceServiceStub()
  const signInService = createSignInServiceStub()
  const notificationService = notificationServiceStub || createNotificationServiceStub()
  const userAdminService = userAdminServiceStub || createUserAdminServiceStub()

  const baseRouter = standardRouter({ licenceService, prisonerService, audit: auditStub, signInService })
  const route = baseRouter(
    createRoute({
      licenceService,
      prisonerService,
      notificationService,
      userAdminService,
      audit: auditStub,
    }),
    'USER_MANAGEMENT'
  )

  return appSetup(route, user, '/hdc/send/')
}
