import { sendingUserName } from '../../utils/userProfile'
import logger from '../../../log'
import { isEmpty, unwrapResult } from '../../utils/functionalHelpers'
import { STAFF_NOT_LINKED, MISSING_PRISON } from '../serviceErrors'
import type { RoContactDetailsService } from '../roContactDetailsService'
import type RoNotificationSender from './roNotificationSender'
import type EventPublisher from './eventPublisher'
import type { LicenceService } from '../licenceService'
import type { WarningClient } from '../../data/warningClient'
import type { DeliusClient } from '../../data/deliusClient'
import type { SendArgs } from './notificationService'
import type { Error, PrisonerService, ResponsibleOfficerAndContactDetails, Result } from '../../../types/licences'

interface RoAndPrison {
  prison: string
  agencyId: string
  responsibleOfficer: ResponsibleOfficerAndContactDetails
}

export default class RoNotificationHandler {
  constructor(
    private readonly roNotificationSender: RoNotificationSender,
    private readonly licenceService: LicenceService,
    private readonly prisonerService: PrisonerService,
    private readonly roContactDetailsService: RoContactDetailsService,
    private readonly warningClient: WarningClient,
    private readonly deliusClient: DeliusClient,
    private readonly eventPublisher: EventPublisher
  ) {}

  /** Need to alert staff to link the records manually otherwise we won't be able to access the RO's email address from their user record and so won't be able to notify them  */
  private async raiseUnlinkedAccountWarning(
    bookingId: number,
    { deliusId, staffIdentifier, name, nomsNumber }: ResponsibleOfficerAndContactDetails
  ) {
    logger.info(`Staff and user records not linked in delius: ${deliusId}`)
    await this.warningClient.raiseWarning(
      bookingId,
      STAFF_NOT_LINKED,
      `RO with delius staff code: '${deliusId}', staff identifier: '${staffIdentifier}' and name: '${name}', responsible for managing: '${nomsNumber}', has unlinked staff record in delius`
    )
  }

  /**
   *  We know that the RO user handling this case requires the Delius RO role to be able to access licences
   *  Attempt the idemptotent operation to add it now.
   */
  private async assignDeliusRoRole(bookingId: number, responsibleOfficer: ResponsibleOfficerAndContactDetails) {
    if (responsibleOfficer.username) {
      logger.info(
        `Assigning community offender manager role to ${responsibleOfficer.username} for booking id: ${bookingId}`
      )
      await this.deliusClient.addResponsibleOfficerRole(responsibleOfficer.username)
    }
  }

  private async loadResponsibleOfficer(bookingId: number, token: string): Promise<Result<RoAndPrison>> {
    const [establishment, result] = await Promise.all([
      this.prisonerService.getEstablishmentForPrisoner(bookingId, token),
      this.roContactDetailsService.getResponsibleOfficerWithContactDetails(bookingId, token),
    ])

    const [responsibleOfficer, error] = unwrapResult(result)

    if (error) {
      return error
    }

    const { premise: prison, agencyId } = establishment || {}
    if (isEmpty(prison)) {
      logger.error(`Missing prison for bookingId: ${bookingId}`)
      return { message: `Missing prison for bookingId: ${bookingId}`, code: MISSING_PRISON }
    }
    return { prison, agencyId, responsibleOfficer }
  }

  async sendRo({ transition, bookingId, prisoner, token, user }: SendArgs): Promise<void> {
    const [responsibleOfficerAndPrison, error] = unwrapResult(await this.loadResponsibleOfficer(bookingId, token))

    if (error) {
      logger.error(`Problem retrieving contact details: ${error.message}`)
      return
    }

    const { prison, agencyId, responsibleOfficer } = responsibleOfficerAndPrison

    if (responsibleOfficer.isUnlinkedAccount) {
      await this.raiseUnlinkedAccountWarning(bookingId, responsibleOfficer)
    }

    await this.licenceService.markForHandover(bookingId, transition.type)

    await this.eventPublisher.raiseCaseHandover({
      username: user.username,
      bookingId,
      transitionType: transition.type,
      submissionTarget: responsibleOfficer,
      source: {
        type: 'prison',
        agencyId,
      },
      target: {
        type: 'probation',
        probationAreaCode: responsibleOfficer.probationAreaCode,
        lduCode: responsibleOfficer.lduCode,
      },
    })

    await this.roNotificationSender.sendNotifications({
      bookingId,
      prisoner,
      responsibleOfficer,
      prison,
      notificationType: transition.notificationType,
      sendingUserName: sendingUserName(user),
    })

    await this.assignDeliusRoRole(bookingId, responsibleOfficer)
  }

  /**
   * Once an unlinked account has been linked, this provides a mechanism to re-send the RO email.
   */
  async sendRoEmail({
    transition,
    bookingId,
    token,
    prisoner,
    user,
  }: SendArgs): Promise<ResponsibleOfficerAndContactDetails | Error> {
    const [responsibleOfficerAndPrison, error] = unwrapResult(await this.loadResponsibleOfficer(bookingId, token))

    if (error) {
      return error
    }

    const { prison, responsibleOfficer } = responsibleOfficerAndPrison

    if (responsibleOfficer.isUnlinkedAccount) {
      return { code: STAFF_NOT_LINKED, message: `User is not linked for bookingId: ${bookingId}` }
    }

    await this.roNotificationSender.sendNotifications({
      bookingId,
      prisoner,
      responsibleOfficer,
      prison,
      notificationType: transition.notificationType,
      sendingUserName: sendingUserName(user),
    })

    await this.assignDeliusRoRole(bookingId, responsibleOfficer)
    return responsibleOfficer
  }
}
