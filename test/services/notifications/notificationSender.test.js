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
      sendEmail: jest.fn().mockResolvedValue({}),
    }
    audit = {
      record: jest.fn().mockReturnValue({}),
    }

    service = createNotificationSender(notifyClient, audit, config.notifications.notifyKey)
  })

  describe('notify', () => {
    test('should do nothing if template ID not in active template list', async () => {
      const notifications = [{ email: ['email@email.com'] }]
      await service.notify({
        sendingUserName: 'username',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).not.toHaveBeenCalled()
    })

    test('should do nothing if empty data', async () => {
      const notifications = [{}]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).not.toHaveBeenCalled()
    })

    test('should do nothing if empty emails', async () => {
      const notifications = [{ email: [] }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).not.toHaveBeenCalled()
    })

    test('should call sendEmail from notifyClient', async () => {
      const notifications = [{ email: 'email@email.com', templateName: 'CA_RETURN' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).toHaveBeenCalled()
    })

    test('should pass in the template id', async () => {
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

      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        templates.CA_RETURN.templateId,
        expect.anything(),
        expect.anything()
      )
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        templates.CA_RETURN_COPY.templateId,
        expect.anything(),
        expect.anything()
      )
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        templates.CA_DECISION.templateId,
        expect.anything(),
        expect.anything()
      )
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        templates.RO_NEW.templateId,
        expect.anything(),
        expect.anything()
      )
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        templates.RO_NEW_COPY.templateId,
        expect.anything(),
        expect.anything()
      )
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        templates.RO_TWO_DAYS.templateId,
        expect.anything(),
        expect.anything()
      )
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        templates.RO_TWO_DAYS_COPY.templateId,
        expect.anything(),
        expect.anything()
      )
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        templates.RO_DUE.templateId,
        expect.anything(),
        expect.anything()
      )
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        templates.RO_DUE_COPY.templateId,
        expect.anything(),
        expect.anything()
      )
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        templates.RO_OVERDUE.templateId,
        expect.anything(),
        expect.anything()
      )
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        templates.RO_OVERDUE_COPY.templateId,
        expect.anything(),
        expect.anything()
      )
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        templates.DM_NEW.templateId,
        expect.anything(),
        expect.anything()
      )
    })

    test('should pass in the email address', async () => {
      const notifications = [{ email: 'email@email.com', templateName: 'CA_RETURN' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(expect.anything(), 'email@email.com', expect.anything())
    })

    test('should pass in the data', async () => {
      const notifications = [{ personalisation: { a: 'a' }, email: ['email@email.com'], templateName: 'CA_RETURN' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
        personalisation: { a: 'a' },
      })
    })

    test('should audit the event', async () => {
      const notifications = [{ personalisation: { a: 'a' }, email: 'email@email.com' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(audit.record).toHaveBeenCalled()
      expect(audit.record).toHaveBeenCalledWith('NOTIFY', 'username', {
        bookingId: 123,
        notificationType: 'CA_RETURN',
        notifications,
      })
    })

    test('should call sendEmail from notifyClient once for each email', async () => {
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
      expect(notifyClient.sendEmail).toHaveBeenCalledTimes(3)
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(expect.anything(), '1@1.com', expect.anything())
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(expect.anything(), '2@2.com', expect.anything())
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(expect.anything(), '3@3.com', expect.anything())
    })

    test('should audit the event only once when multiple email addresses', async () => {
      const notifications = [{ email: '1@1.com' }, { email: '2@2.com' }, { email: '3@3.com' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(audit.record).toHaveBeenCalled()
      expect(audit.record).toHaveBeenCalledWith('NOTIFY', 'username', {
        bookingId: 123,
        notificationType: 'CA_RETURN',
        notifications,
      })
    })
  })
})
