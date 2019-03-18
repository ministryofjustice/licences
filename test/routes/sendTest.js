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

  beforeEach(() => {
    licenceService = createLicenceServiceStub()
    prisonerService = createPrisonerServiceStub()
    userAdminService = createUserAdminServiceStub()
    notificationService = createNotificationServiceStub()

    prisonerService.getOrganisationContactDetails = sinon
      .stub()
      .resolves({ premise: 'HMP Blah', agencyId: 'LT1', com: { name: 'Something', deliusId: 'delius' } })

    prisonerService.getEstablishmentForPrisoner = sinon
      .stub()
      .resolves({ premise: 'HMP Blah', com: { name: 'Something' } })

    prisonerService.getPrisonerDetails = sinon
      .stub()
      .resolves({ firstName: 'first', lastName: 'last', dateOfBirth: 'off-dob' })

    userAdminService.getRoUserByDeliusId = sinon.stub().resolves({ orgEmail: 'expected@email' })

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
      describe('Arriving before 3pm', () => {
        let clock

        beforeEach(() => {
          clock = sinon.useFakeTimers(new Date('March 11, 2019 14:59:59').getTime())
        })

        afterEach(() => {
          clock.restore()
        })

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

          const expectedData = {
            booking_id: '123',
            date: 'Monday 25th March',
            emails: ['expected@email'],
            offender_dob: 'off-dob',
            offender_name: 'first last',
            prison: 'HMP Blah',
            ro_name: 'Something',
          }

          return request(app)
            .post('/hdc/send/addressReview/123')
            .expect(() => {
              expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce()
              expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith('123', 'token')
              expect(userAdminService.getRoUserByDeliusId).to.be.calledOnce()
              expect(userAdminService.getRoUserByDeliusId).to.be.calledWith('delius')
              expect(notificationService.notify).to.be.calledOnce()
              expect(notificationService.notify).to.be.calledWith('CA_USER_TEST', 'RO_NEW', expectedData)
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

          const expectedData = {
            booking_id: '123',
            emails: ['alistair.todd@digital.justice.gov.uk', 'alistair.todd+2@digital.justice.gov.uk'],
            offender_dob: 'off-dob',
            offender_name: 'first last',
            sender_name: 'RO_USER',
          }

          return request(app)
            .post('/hdc/send/finalChecks/123')
            .expect(() => {
              expect(notificationService.notify).to.be.calledOnce()
              expect(notificationService.notify).to.be.calledWith('RO_USER', 'CA_RETURN', expectedData)
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

          const expectedData = {
            booking_id: '123',
            emails: ['alistair.todd@digital.justice.gov.uk', 'alistair.todd+2@digital.justice.gov.uk'],
            offender_dob: 'off-dob',
            offender_name: 'first last',
            sender_name: 'DM_USER',
          }

          return request(app)
            .post('/hdc/send/decided/123')
            .expect(() => {
              expect(notificationService.notify).to.be.calledOnce()
              expect(notificationService.notify).to.be.calledWith('DM_USER', 'CA_DECISION', expectedData)
            })
        })
      })

      describe('Arriving after 3pm', () => {
        let clock

        beforeEach(() => {
          clock = sinon.useFakeTimers(new Date('March 11, 2019 15:00:00').getTime())
        })

        afterEach(() => {
          clock.restore()
        })

        it('Notifies for new RO case - adds extra day when 3pm or later', () => {
          const app = createApp(
            {
              licenceServiceStub: licenceService,
              prisonerServiceStub: prisonerService,
              userAdminServiceStub: userAdminService,
              notificationServiceStub: notificationService,
            },
            'caUser'
          )

          const expectedData = {
            booking_id: '123',
            date: 'Tuesday 26th March',
            emails: ['expected@email'],
            offender_dob: 'off-dob',
            offender_name: 'first last',
            prison: 'HMP Blah',
            ro_name: 'Something',
          }

          return request(app)
            .post('/hdc/send/addressReview/123')
            .expect(() => {
              expect(notificationService.notify).to.be.calledWith('CA_USER_TEST', 'RO_NEW', expectedData)
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
