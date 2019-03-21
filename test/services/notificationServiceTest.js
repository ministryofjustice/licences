const createNotificationService = require('../../server/services/notificationService')
const templates = require('../../server/services/config/notificationTemplates')

describe('notificationService', () => {
  let service
  let prisonerService
  let userAdminService
  let notifyClient
  let audit

  beforeEach(() => {
    prisonerService = {
      getEstablishmentForPrisoner: sinon.stub().resolves({ premise: 'HMP Blah', agencyId: 'LT1' }),
    }
    userAdminService = {
      getRoUserByDeliusId: sinon.stub().resolves({ orgEmail: 'expected@ro.email' }),
    }
    notifyClient = {
      sendEmail: sinon.stub().resolves({}),
    }
    audit = {
      record: sinon.stub().resolves({}),
    }
    service = createNotificationService(prisonerService, userAdminService, notifyClient, audit)
  })

  describe('notify', () => {
    it('should do nothing if no template id configured', async () => {
      const notifications = [{ email: ['email@email.com'] }]
      await service.notify({ user: 'username', type: 'UNKNOWN_TYPE', bookingId: 123, notifications })
      expect(notifyClient.sendEmail).not.to.be.calledOnce()
    })

    it('should do nothing if empty data', async () => {
      const notifications = [{}]
      await service.notify({ user: 'username', type: 'CA_RETURN', bookingId: 123, notifications })
      expect(notifyClient.sendEmail).not.to.be.calledOnce()
    })

    it('should do nothing if empty emails', async () => {
      const notifications = [{ email: [] }]
      await service.notify({ user: 'username', type: 'CA_RETURN', bookingId: 123, notifications })
      expect(notifyClient.sendEmail).not.to.be.calledOnce()
    })

    it('should call sendEmail from notifyClient', async () => {
      const notifications = [{ email: 'email@email.com' }]
      await service.notify({ user: 'username', type: 'CA_RETURN', bookingId: 123, notifications })
      expect(notifyClient.sendEmail).to.be.calledOnce()
    })

    it('should pass in the template id', async () => {
      const notifications = [{ email: ['email@email.com'] }]
      await service.notify({ user: 'username', type: 'CA_RETURN', bookingId: 123, notifications })
      expect(notifyClient.sendEmail).to.be.calledWith(templates.CA_RETURN.templateId, sinon.match.any, sinon.match.any)
    })

    it('should pass in the email address', async () => {
      const notifications = [{ email: 'email@email.com' }]
      await service.notify({ user: 'username', type: 'CA_RETURN', bookingId: 123, notifications })
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, 'email@email.com', sinon.match.any)
    })

    it('should pass in the data', async () => {
      const notifications = [{ personalisation: { a: 'a' }, email: ['email@email.com'] }]
      await service.notify({ user: 'username', type: 'CA_RETURN', bookingId: 123, notifications })
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, sinon.match.any, { personalisation: { a: 'a' } })
    })

    it('should audit the event', async () => {
      const notifications = [{ personalisation: { a: 'a' }, email: 'email@email.com' }]
      await service.notify({ user: 'username', type: 'CA_RETURN', bookingId: 123, notifications })
      expect(audit.record).to.be.calledOnce()
      expect(audit.record).to.be.calledWith('NOTIFY', 'username', {
        bookingId: 123,
        notificationType: 'CA_RETURN',
        notifications,
      })
    })

    it('should call sendEmail from notifyClient once for each email', async () => {
      const notifications = [{ email: '1@1.com' }, { email: '2@2.com' }, { email: '3@3.com' }]
      await service.notify({ user: 'username', type: 'CA_RETURN', bookingId: 123, notifications })
      expect(notifyClient.sendEmail).to.be.calledThrice()
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, '1@1.com', sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, '2@2.com', sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, '3@3.com', sinon.match.any)
    })

    it('should audit the event only once when multiple email addresses', async () => {
      const notifications = [{ email: '1@1.com' }, { email: '2@2.com' }, { email: '3@3.com' }]
      await service.notify({ user: 'username', type: 'CA_RETURN', bookingId: 123, notifications })
      expect(audit.record).to.be.calledOnce()
      expect(audit.record).to.be.calledWith('NOTIFY', 'username', {
        bookingId: 123,
        notificationType: 'CA_RETURN',
        notifications,
      })
    })
  })

  describe('getNotificationData', () => {
    it('should return empty when unknown notification type', async () => {
      const data = await service.getNotificationData({
        prisonerDetails: {},
        notificationType: 'UNKNOWN',
      })

      expect(data).to.eql([])
    })

    describe('RO notification data', () => {
      let clock

      beforeEach(() => {
        clock = sinon.useFakeTimers(new Date('March 11, 2019 14:59:59').getTime())
      })

      afterEach(() => {
        clock.restore()
      })

      it('should return empty when missing COM delius ID', async () => {
        userAdminService.getRoUserByDeliusId = sinon.stub().resolves({ orgEmail: '' })
        const data = await service.getNotificationData({
          prisonerDetails: {},
          notificationType: 'RO_NEW',
          submissionTarget: { com: { deliusId: '' } },
        })

        expect(data).to.eql([])
      })

      it('should return empty when missing RO orgEmail', async () => {
        userAdminService.getRoUserByDeliusId = sinon.stub().resolves({ orgEmail: '' })
        const data = await service.getNotificationData({
          prisonerDetails: {},
          notificationType: 'RO_NEW',
          submissionTarget: { com: { deliusId: 'deliusId', name: 'RO Name' } },
        })

        expect(data).to.eql([])
      })

      it('should throw if error in API calls', async () => {
        prisonerService.getEstablishmentForPrisoner.rejects(new Error('dead'))

        expect(
          service.getNotificationData({
            prisonerDetails: {},
            notificationType: 'RO_NEW',
            submissionTarget: { com: { deliusId: 'deliusId', name: 'RO Name' } },
          })
        ).to.be.rejected()
      })

      it('should generate RO notification data', async () => {
        const data = await service.getNotificationData({
          prisonerDetails: { firstName: 'First', lastName: 'Last', dateOfBirth: '1/1/1' },
          token: 'token',
          notificationType: 'RO_NEW',
          submissionTarget: { com: { deliusId: 'deliusId', name: 'RO Name' } },
          bookingId: '123',
          sendingUser: 'sender',
        })

        expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce()
        expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith('123', 'token')
        expect(userAdminService.getRoUserByDeliusId).to.be.calledOnce()
        expect(userAdminService.getRoUserByDeliusId).to.be.calledWith('deliusId')

        expect(data).to.eql([
          {
            email: 'expected@ro.email',
            personalisation: {
              booking_id: '123',
              date: 'Monday 25th March',
              offender_dob: '1/1/1',
              offender_name: 'First Last',
              prison: 'HMP Blah',
              ro_name: 'RO Name',
            },
          },
        ])
      })
    })

    describe('CA notification data', () => {
      it('should return empty when missing CA email addresses for agency', async () => {
        const data = await service.getNotificationData({
          prisonerDetails: {},
          notificationType: 'CA_RETURN',
          submissionTarget: { agencyId: 'MISSING' },
        })

        expect(data).to.eql([])
      })

      it('should generate CA notification data', async () => {
        const data = await service.getNotificationData({
          prisonerDetails: { firstName: 'First', lastName: 'Last', dateOfBirth: '1/1/1' },
          token: 'token',
          notificationType: 'CA_RETURN',
          submissionTarget: { agencyId: 'LT1' },
          bookingId: '123',
          sendingUser: { username: 'sender' },
        })

        expect(data).to.eql([
          {
            email: 'hdc_test@digital.justice.gov.uk',
            personalisation: {
              booking_id: '123',
              offender_dob: '1/1/1',
              offender_name: 'First Last',
              sender_name: 'sender',
            },
          },
          {
            email: 'hdc_test+2@digital.justice.gov.uk',
            personalisation: {
              booking_id: '123',
              offender_dob: '1/1/1',
              offender_name: 'First Last',
              sender_name: 'sender',
            },
          },
        ])
      })
    })

    describe('DM notification data', () => {
      it('should return empty when missing DM email addresses for agency', async () => {
        prisonerService.getEstablishmentForPrisoner = sinon.stub().resolves({ agencyId: 'MISSING' })
        const data = await service.getNotificationData({
          prisonerDetails: {},
          notificationType: 'DM_NEW',
        })

        expect(data).to.eql([])
      })

      it('should generate DM notification data', async () => {
        const data = await service.getNotificationData({
          prisonerDetails: { firstName: 'First', lastName: 'Last', dateOfBirth: '1/1/1' },
          token: 'token',
          notificationType: 'DM_NEW',
          submissionTarget: { agencyId: 'LT1' },
          bookingId: '123',
          sendingUser: { username: 'sender' },
        })

        expect(data).to.eql([
          {
            email: 'hdc_test@digital.justice.gov.uk',
            personalisation: {
              booking_id: '123',
              offender_dob: '1/1/1',
              offender_name: 'First Last',
              dm_name: 'LT1 DM',
            },
          },
          {
            email: 'hdc_test+2@digital.justice.gov.uk',
            personalisation: {
              booking_id: '123',
              offender_dob: '1/1/1',
              offender_name: 'First Last',
              dm_name: 'LT1 DM2',
            },
          },
        ])
      })
    })
  })
})
