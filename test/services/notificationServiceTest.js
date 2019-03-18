const createNotificationService = require('../../server/services/notificationService')
const templates = require('../../server/services/config/notificationTemplates')

describe('notificationService', () => {
  let service
  let notifyClient
  let audit

  beforeEach(() => {
    notifyClient = {
      sendEmail: sinon.stub().resolves({}),
    }
    audit = {
      record: sinon.stub().resolves({}),
    }
    service = createNotificationService(notifyClient, audit)
  })

  describe('notify', () => {
    it('should do nothing if no template id configured', async () => {
      const personalisation = { emails: ['email@email.com'] }
      await service.notify('username', 'UNKNOWN_TYPE', personalisation)
      expect(notifyClient.sendEmail).not.to.be.calledOnce()
    })

    it('should do nothing if empty data', async () => {
      const personalisation = {}
      await service.notify('username', 'UNKNOWN_TYPE', personalisation)
      expect(notifyClient.sendEmail).not.to.be.calledOnce()
    })

    it('should do nothing if empty emails', async () => {
      const personalisation = { emails: [] }
      await service.notify('username', 'UNKNOWN_TYPE', personalisation)
      expect(notifyClient.sendEmail).not.to.be.calledOnce()
    })

    it('should call sendEmail from notifyClient', async () => {
      const personalisation = { emails: ['email@email.com'] }
      await service.notify('username', 'CA_RETURN', personalisation)
      expect(notifyClient.sendEmail).to.be.calledOnce()
    })

    it('should pass in the template id', async () => {
      const personalisation = { emails: ['email@email.com'] }
      await service.notify('username', 'CA_RETURN', personalisation)
      expect(notifyClient.sendEmail).to.be.calledWith(templates.CA_RETURN.templateId, sinon.match.any, sinon.match.any)
    })

    it('should pass in the email address', async () => {
      const personalisation = { emails: ['email@email.com'] }
      await service.notify('username', 'CA_RETURN', personalisation)
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, 'email@email.com', sinon.match.any)
    })

    it('should pass in the data', async () => {
      const personalisation = { a: 'a', emails: ['email@email.com'] }
      await service.notify('username', 'CA_RETURN', personalisation)
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, sinon.match.any, { personalisation })
    })

    it('should audit the event', async () => {
      const personalisation = { booking_id: 123, emails: ['email@email.com'] }
      await service.notify('username', 'CA_RETURN', personalisation)
      expect(audit.record).to.be.calledOnce()
      expect(audit.record).to.be.calledWith('NOTIFY', 'username', {
        bookingId: 123,
        notificationData: personalisation,
        notificationType: 'CA_RETURN',
      })
    })

    it('should call sendEmail from notifyClient once for each email', async () => {
      const personalisation = { emails: ['1@1.com', '2@2.com', '3@3.com'] }
      await service.notify('username', 'CA_RETURN', personalisation)
      expect(notifyClient.sendEmail).to.be.calledThrice()
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, '1@1.com', sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, '2@2.com', sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, '3@3.com', sinon.match.any)
    })

    it('should audit the event only once when multiple email addresses', async () => {
      const personalisation = { booking_id: 123, emails: ['1@1.com', '2@2.com', '3@3.com'] }
      await service.notify('username', 'CA_RETURN', personalisation)
      expect(audit.record).to.be.calledOnce()
      expect(audit.record).to.be.calledWith('NOTIFY', 'username', {
        bookingId: 123,
        notificationData: personalisation,
        notificationType: 'CA_RETURN',
      })
    })
  })
})
