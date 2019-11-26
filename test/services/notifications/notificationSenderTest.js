const createNotificationSender = require('../../../server/services/notifications/notificationSender')
const templates = require('../../../server/services/config/notificationTemplates')

describe('notificationSender', () => {
  let service
  let notifyClient
  let audit
  let config

  beforeEach(() => {
    config = {
      notifications: {
        notifyKey: 'dummy-key',
        clearingOfficeEmail: 'HDC.ClearingOffice@justice.gov.uk',
        clearingOfficeEmailEnabled: 'YES',
        activeNotificationTypes: [
          'CA_RETURN',
          'CA_DECISION',
          'RO_NEW',
          'RO_TWO_DAYS',
          'RO_DUE',
          'RO_OVERDUE',
          'DM_NEW',
          'DM_TO_CA_RETURN',
        ],
      },
      domain: 'http://localhost:3000',
    }

    notifyClient = {
      sendEmail: sinon.stub().resolves({}),
    }
    audit = {
      record: sinon.stub().resolves({}),
    }

    service = createNotificationSender(notifyClient, audit, config)
  })

  describe('notify', () => {
    it('should do nothing if template ID not in active template list', async () => {
      const notifications = [{ email: ['email@email.com'] }]
      await service.notify({
        sendingUserName: 'username',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).not.to.be.calledOnce()
    })

    it('should do nothing if empty data', async () => {
      const notifications = [{}]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).not.to.be.calledOnce()
    })

    it('should do nothing if empty emails', async () => {
      const notifications = [{ email: [] }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).not.to.be.calledOnce()
    })

    it('should call sendEmail from notifyClient', async () => {
      const notifications = [{ email: 'email@email.com', templateName: 'CA_RETURN' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).to.be.calledOnce()
    })

    it('should pass in the template id', async () => {
      const notifications = [
        { email: 'email@email.com', templateName: 'CA_RETURN' },
        { email: 'email@email.com', templateName: 'CA_RETURN_COPY' },
        { email: 'email@email.com', templateName: 'CA_DECISION' },
        { email: 'email@email.com', templateName: 'RO_NEW' },
        { email: 'email@email.com', templateName: 'RO_NEW_COPY' },
        { email: 'email@email.com', templateName: 'RO_TWO_DAYS' },
        { email: 'email@email.com', templateName: 'RO_TWO_DAYS_COPY' },
        { email: 'email@email.com', templateName: 'RO_DUE' },
        { email: 'email@email.com', templateName: 'RO_DUE_COPY' },
        { email: 'email@email.com', templateName: 'RO_OVERDUE' },
        { email: 'email@email.com', templateName: 'RO_OVERDUE_COPY' },
        { email: 'email@email.com', templateName: 'DM_NEW' },
      ]

      await service.notify({ user: 'username', notificationType: 'CA_RETURN', bookingId: 123, notifications })

      expect(notifyClient.sendEmail).to.be.calledWith(templates.CA_RETURN.templateId, sinon.match.any, sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.CA_RETURN_COPY.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.CA_DECISION.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(templates.RO_NEW.templateId, sinon.match.any, sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.RO_NEW_COPY.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.RO_TWO_DAYS.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.RO_TWO_DAYS_COPY.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(templates.RO_DUE.templateId, sinon.match.any, sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.RO_DUE_COPY.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(templates.RO_OVERDUE.templateId, sinon.match.any, sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.RO_OVERDUE_COPY.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(templates.DM_NEW.templateId, sinon.match.any, sinon.match.any)
    })

    it('should pass in the email address', async () => {
      const notifications = [{ email: 'email@email.com', templateName: 'CA_RETURN' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, 'email@email.com', sinon.match.any)
    })

    it('should pass in the data', async () => {
      const notifications = [{ personalisation: { a: 'a' }, email: ['email@email.com'], templateName: 'CA_RETURN' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, sinon.match.any, { personalisation: { a: 'a' } })
    })

    it('should audit the event', async () => {
      const notifications = [{ personalisation: { a: 'a' }, email: 'email@email.com' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(audit.record).to.be.calledOnce()
      expect(audit.record).to.be.calledWith('NOTIFY', 'username', {
        bookingId: 123,
        notificationType: 'CA_RETURN',
        notifications,
      })
    })

    it('should call sendEmail from notifyClient once for each email', async () => {
      const notifications = [
        { email: '1@1.com', templateName: 'CA_RETURN' },
        { email: '2@2.com', templateName: 'CA_RETURN_COPY' },
        { email: '3@3.com', templateName: 'CA_RETURN' },
      ]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).to.be.calledThrice()
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, '1@1.com', sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, '2@2.com', sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, '3@3.com', sinon.match.any)
    })

    it('should audit the event only once when multiple email addresses', async () => {
      const notifications = [{ email: '1@1.com' }, { email: '2@2.com' }, { email: '3@3.com' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(audit.record).to.be.calledOnce()
      expect(audit.record).to.be.calledWith('NOTIFY', 'username', {
        bookingId: 123,
        notificationType: 'CA_RETURN',
        notifications,
      })
    })
  })
})
