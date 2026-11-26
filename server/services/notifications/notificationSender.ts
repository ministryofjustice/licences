import templates from '../config/notificationTemplates'
import logger from '../../../log'
import { isEmpty } from '../../utils/functionalHelpers'
import type { AuditClient } from '../../data/audit'

export interface Notification {
  personalisation: object
  email: string
  templateName: string
}

export interface NotifyArgs {
  sendingUserName: string
  notificationType: string
  bookingId: number
  notifications: Notification[]
}

export default class NotificationSender {
  constructor(
    private readonly notifyClient: {
      sendEmail: (templateId: string, email: string, options: { personalisation: object }) => Promise<unknown>
    },
    private readonly audit: AuditClient,
    private readonly notifyKey: string
  ) {}

  async notify({ sendingUserName, notificationType, bookingId, notifications }: NotifyArgs): Promise<void> {
    if (isEmpty(this.notifyKey) || this.notifyKey === 'NOTIFY_OFF') {
      logger.warn('No notification API key - notifications disabled')
      return
    }

    if (isEmpty(notifications)) {
      logger.warn('Empty notifications')
      return
    }

    notifications.forEach((notification) => {
      if (isEmpty(templates[notification.templateName])) {
        logger.warn(`Unmapped notification template name: ${notification.templateName}`)
        return
      }

      const { templateId } = templates[notification.templateName]

      if (isEmpty(notification.email)) {
        logger.warn('Empty notification email')
      } else {
        this.notifyClient
          .sendEmail(templateId, notification.email, { personalisation: notification.personalisation })
          .then(() => {
            logger.info(`Successful notify for email: ${notification.email}`)
          })
          .catch((error) => {
            logger.error({ email: notification.email }, 'Error sending notification email ')
            logger.error(error.stack)
          })
      }
    })
    this.audit.record('NOTIFY', sendingUserName, {
      bookingId,
      notificationType,
      notifications,
    })
  }
}
