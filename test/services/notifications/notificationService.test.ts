import NotificationService from '../../../server/services/notifications/notificationService'
import CaAndDmNotificationSender from '../../../server/services/notifications/caAndDmNotificationSender'
import RoNotificationHandler from '../../../server/services/notifications/roNotificationHandler'
import EventPublisher from '../../../server/services/notifications/eventPublisher'
import { LicenceService } from '../../../server/services/licenceService'
import transitionForDestinations from '../../../server/services/notifications/transitionsForDestinations'

jest.mock('../../../server/services/notifications/caAndDmNotificationSender')
jest.mock('../../../server/services/notifications/roNotificationHandler')
jest.mock('../../../server/services/notifications/eventPublisher')
jest.mock('../../../server/services/licenceService')

const { createPrisonerServiceStub } = require('../../mockServices')

describe('NotificationService', () => {
  let caAndDmNotificationSender: jest.Mocked<CaAndDmNotificationSender>
  let eventPublisher: jest.Mocked<EventPublisher>
  let licenceService: jest.Mocked<LicenceService>
  let prisonerService
  let notificationService: NotificationService
  let roNotificationHandler: jest.Mocked<RoNotificationHandler>

  const prisoner = { firstName: 'first', lastName: 'last', dateOfBirth: 'off-dob', offenderNo: 'AB1234A' }
  const submissionTarget = { premise: 'HMP Test', agencyId: 'LT1', name: 'Something', deliusId: 'delius' }
  const bookingId = -1
  const token = 'token-1'
  const licence = {}
  const username = 'bob'
  const user = { username }
  const source = { type: 'probation', probationAreaCode: 'Test Area', lduCode: 'Test Unit' }
  const target = { type: 'prison', agencyId: 'LT1' }

  beforeEach(() => {
    licenceService = new LicenceService(undefined) as jest.Mocked<LicenceService>
    licenceService.removeDecision.mockResolvedValue({} as never)
    roNotificationHandler = new RoNotificationHandler(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    ) as jest.Mocked<RoNotificationHandler>

    prisonerService = createPrisonerServiceStub()
    prisonerService.getDestinations.mockReturnValue({
      submissionTarget,
      source,
      target,
    })

    prisonerService.getOrganisationContactDetails.mockReturnValue(submissionTarget)
    prisonerService.getPrisonerPersonalDetails.mockReturnValue(prisoner)

    caAndDmNotificationSender = new CaAndDmNotificationSender(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    ) as jest.Mocked<CaAndDmNotificationSender>
    caAndDmNotificationSender.sendNotifications.mockResolvedValue([])

    eventPublisher = new EventPublisher(undefined, undefined) as jest.Mocked<EventPublisher>

    notificationService = new NotificationService(
      caAndDmNotificationSender,
      licenceService,
      prisonerService,
      roNotificationHandler,
      eventPublisher
    )
  })

  describe('Get send/:destination/:bookingId', () => {
    test('dispatches caToRo notifications to roNotificationHandler', async () => {
      await notificationService.send({
        transition: transitionForDestinations.addressReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(roNotificationHandler.sendRo).toHaveBeenCalledWith({
        transition: transitionForDestinations.addressReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })
    })

    test('handles roToCa when finalChecks is destination', async () => {
      await notificationService.send({
        transition: transitionForDestinations.finalChecks,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(caAndDmNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId,
        notificationType: 'CA_RETURN',
        prisoner,
        sendingUserName: username,
        submissionTarget,
        token,
      })
      expect(eventPublisher.raiseCaseHandover).toHaveBeenCalledWith({
        username,
        bookingId,
        transitionType: 'roToCa',
        submissionTarget,
        source,
        target,
      })
      expect(licenceService.markForHandover).toHaveBeenCalledWith(bookingId, 'roToCa')
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('handles caToDm when approval is destination', async () => {
      await notificationService.send({
        transition: transitionForDestinations.approval,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(caAndDmNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId,
        notificationType: 'DM_NEW',
        prisoner,
        sendingUserName: username,
        submissionTarget,
        token,
      })

      expect(eventPublisher.raiseCaseHandover).toHaveBeenCalledWith({
        username,
        bookingId,
        transitionType: 'caToDm',
        submissionTarget,
        source,
        target,
      })
      expect(licenceService.markForHandover).toHaveBeenCalledWith(bookingId, 'caToDm')
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('handles dmToCa when decided is destination', async () => {
      await notificationService.send({
        transition: transitionForDestinations.decided,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(caAndDmNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId,
        notificationType: 'CA_DECISION',
        prisoner,
        sendingUserName: username,
        submissionTarget,
        token,
      })
      expect(eventPublisher.raiseCaseHandover).toHaveBeenCalledWith({
        username,
        bookingId,
        transitionType: 'dmToCa',
        submissionTarget,
        source,
        target,
      })
      expect(licenceService.markForHandover).toHaveBeenCalledWith(bookingId, 'dmToCa')
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('handles caToDmRefusal when refusal is destination', async () => {
      await notificationService.send({
        transition: transitionForDestinations.refusal,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(caAndDmNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId,
        notificationType: 'DM_NEW',
        prisoner,
        sendingUserName: username,
        submissionTarget,
        token,
      })
      expect(eventPublisher.raiseCaseHandover).toHaveBeenCalledWith({
        username,
        bookingId,
        transitionType: 'caToDmRefusal',
        submissionTarget,
        source,
        target,
      })
      expect(licenceService.markForHandover).toHaveBeenCalledWith(bookingId, 'caToDmRefusal')
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('handles dmToCaReturn when return is destination', async () => {
      await notificationService.send({
        transition: transitionForDestinations.return,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(caAndDmNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId,
        notificationType: 'DM_TO_CA_RETURN',
        prisoner,
        sendingUserName: username,
        submissionTarget,
        token,
      })
      expect(eventPublisher.raiseCaseHandover).toHaveBeenCalledWith({
        username,
        bookingId,
        transitionType: 'dmToCaReturn',
        submissionTarget,
        source,
        target,
      })
      expect(licenceService.markForHandover).toHaveBeenCalledWith(bookingId, 'dmToCaReturn')
      expect(licenceService.removeDecision).toHaveBeenCalledWith(bookingId, {})
    })
  })
})
