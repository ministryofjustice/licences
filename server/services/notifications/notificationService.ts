import { sendingUserName } from '../../utils/userProfile'
import type CaAndDmNotificationSender from './caAndDmNotificationSender'
import type RoNotificationHandler from './roNotificationHandler'
import type EventPublisher from './eventPublisher'
import type { LicenceService } from '../licenceService'
import type { PrisonerService } from '../../../types/licences'

export interface Transition {
  type: string
  sender: string
  receiver: string
  notificationType: string
}

export interface NotificationUser {
  username: string
  name?: string
}

export interface SendArgs {
  transition: Transition
  bookingId: number
  token: string
  licence?: unknown
  prisoner: any
  user: NotificationUser
}

export default class NotificationService {
  constructor(
    private readonly caAndDmNotificationSender: CaAndDmNotificationSender,
    private readonly licenceService: LicenceService,
    private readonly prisonerService: PrisonerService,
    private readonly roNotificationHandler: RoNotificationHandler,
    private readonly eventPublisher: EventPublisher
  ) {}

  async send(args: SendArgs) {
    return args.transition.receiver === 'RO' ? this.roNotificationHandler.sendRo(args) : this.sendCaOrDm(args)
  }

  private async sendCaOrDm({ transition, bookingId, token, licence, prisoner, user }: SendArgs) {
    const { submissionTarget, source, target } = await this.prisonerService.getDestinations(
      transition.sender,
      transition.receiver,
      bookingId,
      token
    )

    await this.licenceService.markForHandover(bookingId, transition.type)

    if (transition.type === 'dmToCaReturn') {
      await this.licenceService.removeDecision(bookingId, licence)
    }

    await this.eventPublisher.raiseCaseHandover({
      username: user.username,
      bookingId,
      transitionType: transition.type,
      submissionTarget,
      source,
      target,
    })

    this.caAndDmNotificationSender.sendNotifications({
      bookingId,
      prisoner,
      notificationType: transition.notificationType,
      submissionTarget,
      sendingUserName: sendingUserName(user),
      token,
    })
  }
}
