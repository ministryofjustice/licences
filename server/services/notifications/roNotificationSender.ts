import moment from 'moment'
import logger from '../../../log'
import { isEmpty } from '../../utils/functionalHelpers'
import { getRoCaseDueDate, getRoNewCaseDueDate } from '../../utils/dueDates'
import type NotificationSender from './notificationSender'
import type { Notification } from './notificationSender'
import type { NotificationArgs, ResponsibleOfficerAndContactDetails } from '../../../types/licences'

interface NotificationTypeConfig {
  templateNames: { STANDARD: string; COPY: string }
}

export default class RoNotificationSender {
  readonly notificationTypes: Record<string, NotificationTypeConfig> = {
    RO_NEW: { templateNames: { STANDARD: 'RO_NEW', COPY: 'RO_NEW_COPY' } },
    RO_TWO_DAYS: { templateNames: { STANDARD: 'RO_TWO_DAYS', COPY: 'RO_TWO_DAYS_COPY' } },
    RO_DUE: { templateNames: { STANDARD: 'RO_DUE', COPY: 'RO_DUE_COPY' } },
    RO_OVERDUE: { templateNames: { STANDARD: 'RO_OVERDUE', COPY: 'RO_OVERDUE_COPY' } },
  }

  constructor(
    private readonly notificationSender: NotificationSender,
    private readonly activeNotificationTypes: string[],
    private readonly domain: string
  ) {}

  private variables(bookingId, prisoner, roName, organisation, prison, transitionDate) {
    const date = transitionDate ? getRoCaseDueDate(moment(transitionDate)) : getRoNewCaseDueDate()
    return {
      booking_id: bookingId,
      offenderNo: prisoner.offenderNo,
      offender_name: [prisoner.firstName, prisoner.lastName].join(' '),
      domain: this.domain,
      ro_name: roName,
      organisation,
      prison,
      date,
    }
  }

  getNotifications(
    responsibleOfficer: ResponsibleOfficerAndContactDetails,
    personalisation: object,
    { templateNames }: NotificationTypeConfig
  ): Notification[] {
    const { email, functionalMailbox } = responsibleOfficer

    const sendToRo = !isEmpty(email)
    const sendToRoOrg = !isEmpty(functionalMailbox)

    return [
      ...(sendToRo ? [{ personalisation, email, templateName: templateNames.STANDARD }] : []),
      ...(sendToRoOrg ? [{ personalisation, email: functionalMailbox, templateName: templateNames.COPY }] : []),
    ]
  }

  async sendNotifications({
    responsibleOfficer,
    notificationType,
    bookingId,
    prisoner,
    prison,
    transitionDate,
    sendingUserName,
  }: NotificationArgs): Promise<Notification[]> {
    if (!this.activeNotificationTypes.includes(notificationType)) {
      return []
    }

    const notificationConfig = this.notificationTypes[notificationType]

    const personalisation = this.variables(
      bookingId,
      prisoner,
      responsibleOfficer.name,
      responsibleOfficer.organisation,
      prison,
      transitionDate
    )

    try {
      const notifications = this.getNotifications(responsibleOfficer, personalisation, notificationConfig)
      logger.info({ notifications }, 'Sending notifications')
      await this.notificationSender.notify({ sendingUserName, notificationType, bookingId, notifications })

      return notifications
    } catch (error) {
      logger.error(
        { stack: (error as Error).stack },
        `Error sending notification for bookingId: ${bookingId}, transition: ${notificationType}`
      )
      return []
    }
  }
}
