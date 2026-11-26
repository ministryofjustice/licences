import * as R from 'ramda'
import logger from '../../../log'
import { getIn, isEmpty } from '../../utils/functionalHelpers'
import type { PrisonerService } from '../../../types/licences'
import type { RoContactDetailsService } from '../roContactDetailsService'
import type { ConfigClient } from '../../data/configClient'
import type NotificationSender from './notificationSender'
import type { Notification } from './notificationSender'
import type nomisClientBuilderFn from '../../data/nomisClientBuilder'

interface NotificationDataArgs {
  prisoner?: any
  token: string
  notificationType?: string
  submissionTarget?: any
  bookingId: number
  transitionDate?: string
  sendingUserName: string
}

type NotificationDataMethodArgs = Omit<NotificationDataArgs, 'prisoner' | 'notificationType'> & {
  common: Record<string, unknown>
}

// object -> string -> string
const replaceName = (replacements) => (name) => R.propOr(name, name, replacements)

// object -> [notification] -> [notification]
const replaceTemplateNames = (replacements) => R.map(R.over(R.lensProp('templateName'), replaceName(replacements)))

export default class CaAndDmNotificationSender {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly roContactDetailsService: RoContactDetailsService,
    private readonly configClient: ConfigClient,
    private readonly notificationSender: NotificationSender,
    private readonly nomisClientBuilder: typeof nomisClientBuilderFn,
    private readonly activeNotificationTypes: string[],
    private readonly domain: string
  ) {}

  private readonly notificationDataMethod: Record<string, (args: NotificationDataMethodArgs) => Promise<Notification[]>> =
    {
      CA_RETURN: (args) =>
        this.getCaAndRoOrganisationNotifications(args).then(
          replaceTemplateNames({ STANDARD: 'CA_RETURN', COPY: 'CA_RETURN_COPY' })
        ),
      DM_TO_CA_RETURN: (args) =>
        this.getCaNotifications(args).then(replaceTemplateNames({ STANDARD: 'CA_RETURN' })),
      CA_DECISION: (args) => this.getCaNotifications(args).then(replaceTemplateNames({ STANDARD: 'CA_DECISION' })),
      DM_NEW: (args) => this.getDmNotifications(args).then(replaceTemplateNames({ STANDARD: 'DM_NEW' })),
    }

  async getNotificationData({
    prisoner,
    token,
    notificationType,
    submissionTarget,
    bookingId,
    transitionDate,
    sendingUserName,
  }: NotificationDataArgs): Promise<Notification[]> {
    const common = {
      offender_name: [prisoner.firstName, prisoner.lastName].join(' '),
      offender_dob: prisoner.dateOfBirth,
      offender_noms: prisoner.offenderNo,
      booking_id: bookingId,
      domain: this.domain,
    }

    return this.notificationDataMethod[notificationType]
      ? this.notificationDataMethod[notificationType]({
          common,
          token,
          submissionTarget,
          bookingId,
          transitionDate,
          sendingUserName,
        })
      : []
  }

  private async roOrganisationNotification(args: NotificationDataMethodArgs, notifications: Notification[]) {
    const orgEmail = await this.roContactDetailsService.getFunctionalMailBox(args.bookingId, args.token)
    return isEmpty(orgEmail) || isEmpty(notifications)
      ? []
      : [{ ...notifications[0], email: orgEmail, templateName: 'COPY' }]
  }

  private async getCaAndRoOrganisationNotifications(args: NotificationDataMethodArgs) {
    const notifications = await this.getCaNotifications(args)
    return [...notifications, ...(await this.roOrganisationNotification(args, notifications))]
  }

  private async getCaNotifications({
    common,
    token,
    submissionTarget,
    sendingUserName,
  }: NotificationDataMethodArgs): Promise<Notification[]> {
    const agencyId = getIn(submissionTarget, ['agencyId'])

    if (isEmpty(agencyId)) {
      logger.error('Missing agencyId for CA notification')
      return []
    }

    const establishment = await this.nomisClientBuilder(token).getEstablishment(agencyId)
    const prison = establishment.premise

    const mailboxes = await this.configClient.getMailboxes(submissionTarget.agencyId, 'CA')

    if (isEmpty(mailboxes)) {
      logger.error(`Missing CA notification email addresses for agencyId: ${agencyId}`)
      return []
    }
    const personalisation = { ...common, sender_name: sendingUserName, prison }

    return mailboxes.map((mailbox) => {
      return {
        personalisation: { ...personalisation, ca_name: mailbox.name },
        email: mailbox.email,
        templateName: 'STANDARD',
      }
    })
  }

  private async getDmNotifications({ common, token, bookingId }: NotificationDataMethodArgs): Promise<Notification[]> {
    const establishment = await this.prisonerService.getEstablishmentForPrisoner(bookingId, token)

    const mailboxes = await this.configClient.getMailboxes(establishment.agencyId, 'DM')

    if (isEmpty(mailboxes)) {
      logger.error(`Missing DM notification email addresses for agencyId: ${establishment.agencyId}`)
      return []
    }

    return mailboxes.map((mailbox) => {
      return { personalisation: { ...common, dm_name: mailbox.name }, email: mailbox.email, templateName: 'STANDARD' }
    })
  }

  async sendNotifications({
    prisoner,
    token,
    notificationType,
    submissionTarget,
    bookingId,
    transitionDate,
    sendingUserName,
  }: NotificationDataArgs): Promise<Notification[]> {
    if (!this.activeNotificationTypes.includes(notificationType)) {
      return []
    }

    try {
      const notifications = await this.getNotificationData({
        prisoner,
        token,
        notificationType,
        submissionTarget,
        bookingId,
        transitionDate,
        sendingUserName,
      })

      if (isEmpty(notifications)) {
        return []
      }

      await this.notificationSender.notify({
        sendingUserName,
        notificationType,
        bookingId,
        notifications,
      })

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
