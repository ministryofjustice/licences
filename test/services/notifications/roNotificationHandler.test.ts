import RoNotificationHandler from '../../../server/services/notifications/roNotificationHandler'
import RoNotificationSender from '../../../server/services/notifications/roNotificationSender'
import EventPublisher from '../../../server/services/notifications/eventPublisher'
import transitionForDestinations from '../../../server/services/notifications/transitionsForDestinations'
import { STAFF_NOT_LINKED } from '../../../server/services/serviceErrors'
import { RoContactDetailsService } from '../../../server/services/roContactDetailsService'
import { LicenceService } from '../../../server/services/licenceService'
import { WarningClient } from '../../../server/data/warningClient'
import { DeliusClient } from '../../../server/data/deliusClient'
import { ResponsibleOfficerAndContactDetails } from '../../../types/licences'

jest.mock('../../../server/services/roContactDetailsService')
jest.mock('../../../server/services/notifications/roNotificationSender')
jest.mock('../../../server/services/notifications/eventPublisher')
jest.mock('../../../server/services/licenceService')
jest.mock('../../../server/data/warningClient')
jest.mock('../../../server/data/deliusClient')

const { createPrisonerServiceStub } = require('../../mockServices')

describe('roNotificationHandler', () => {
  let roNotificationSender: jest.Mocked<RoNotificationSender>
  let licenceService: jest.Mocked<LicenceService>
  let prisonerService
  let eventPublisher: jest.Mocked<EventPublisher>
  let warningClient: jest.Mocked<WarningClient>
  let deliusClient: jest.Mocked<DeliusClient>
  let roNotificationHandler: RoNotificationHandler
  let roContactDetailsService: jest.Mocked<RoContactDetailsService>

  const prisoner = { firstName: 'first', lastName: 'last', dateOfBirth: 'off-dob', offenderNo: 'AB1234A' }
  const submissionTarget = { premise: 'HMP Test', agencyId: 'LT1', name: 'Something', deliusId: 'delius' }
  const bookingId = -1
  const token = 'token-1'
  const licence = {}
  const username = 'bob'
  const user = { username }

  beforeEach(() => {
    licenceService = new LicenceService(undefined) as jest.Mocked<LicenceService>
    roContactDetailsService = new RoContactDetailsService(
      undefined,
      undefined,
      undefined
    ) as jest.Mocked<RoContactDetailsService>
    warningClient = new WarningClient() as jest.Mocked<WarningClient>
    deliusClient = new DeliusClient(undefined) as jest.Mocked<DeliusClient>
    roNotificationSender = new RoNotificationSender(undefined, undefined, undefined) as jest.Mocked<RoNotificationSender>
    roNotificationSender.sendNotifications.mockResolvedValue([])
    eventPublisher = new EventPublisher(undefined, undefined) as jest.Mocked<EventPublisher>

    prisonerService = createPrisonerServiceStub()
    prisonerService.getEstablishmentForPrisoner.mockReturnValue({ premise: 'HMP Test', agencyId: 'LT1' })
    prisonerService.getOrganisationContactDetails.mockReturnValue(submissionTarget)
    prisonerService.getPrisonerPersonalDetails.mockReturnValue(prisoner)

    roNotificationHandler = new RoNotificationHandler(
      roNotificationSender,
      licenceService,
      prisonerService,
      roContactDetailsService,
      warningClient,
      deliusClient,
      eventPublisher
    )
  })

  describe('send Ro', () => {
    test('handles caToRo', async () => {
      const responsibleOfficer = {
        name: 'Test Person',
        deliusId: 'delius1',
        email: 'ro@user.com',
        lduCode: 'code-1',
        lduDescription: 'lduDescription-1',
        nomsNumber: 'AAAA12',
        probationAreaCode: 'prob-code-1',
        probationAreaDescription: 'prob-desc-1',
      } as ResponsibleOfficerAndContactDetails

      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue(responsibleOfficer)

      await roNotificationHandler.sendRo({
        transition: transitionForDestinations.addressReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(roNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId,
        prisoner,
        responsibleOfficer,
        prison: 'HMP Test',
        notificationType: 'RO_NEW',
        sendingUserName: username,
      })
      expect(eventPublisher.raiseCaseHandover).toHaveBeenCalledWith({
        username,
        bookingId,
        transitionType: 'caToRo',
        submissionTarget: responsibleOfficer,
        source: {
          agencyId: 'LT1',
          type: 'prison',
        },
        target: {
          lduCode: 'code-1',
          probationAreaCode: 'prob-code-1',
          type: 'probation',
        },
      })
      expect(licenceService.markForHandover).toHaveBeenCalledWith(bookingId, 'caToRo')
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('caToRo when cannot get RO contact details', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue({
        message: 'failed to find RO',
        code: '404',
      })

      await roNotificationHandler.sendRo({
        transition: transitionForDestinations.bassReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(roNotificationSender.sendNotifications).not.toHaveBeenCalled()
      expect(eventPublisher.raiseCaseHandover).not.toHaveBeenCalled()
      expect(licenceService.markForHandover).not.toHaveBeenCalled()
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('caToRo when cannot get prison', async () => {
      const responsibleOfficer = {
        name: 'Test Person',
        deliusId: 'delius1',
        email: 'ro@user.com',
        lduCode: 'code-1',
        lduDescription: 'lduDescription-1',
        nomsNumber: 'AAAA12',
        probationAreaCode: 'prob-code-1',
        probationAreaDescription: 'prob-desc-1',
      } as ResponsibleOfficerAndContactDetails

      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue(responsibleOfficer)
      prisonerService.getEstablishmentForPrisoner.mockResolvedValue(null)

      await roNotificationHandler.sendRo({
        transition: transitionForDestinations.bassReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(roNotificationSender.sendNotifications).not.toHaveBeenCalled()
      expect(eventPublisher.raiseCaseHandover).not.toHaveBeenCalled()
      expect(licenceService.markForHandover).not.toHaveBeenCalled()
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('caToRo when delius staff records are not linked to user', async () => {
      const responsibleOfficer = {
        name: 'Test Person',
        deliusId: 'STAFF-1',
        staffIdentifier: 1,
        lduCode: 'code-1',
        lduDescription: 'lduDescription-1',
        nomsNumber: 'AAAA12',
        probationAreaCode: 'prob-code-1',
        probationAreaDescription: 'prob-desc-1',
        isUnlinkedAccount: true,
      } as ResponsibleOfficerAndContactDetails

      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue(responsibleOfficer)

      await roNotificationHandler.sendRo({
        transition: transitionForDestinations.bassReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(warningClient.raiseWarning).toHaveBeenCalledWith(
        bookingId,
        STAFF_NOT_LINKED,
        `RO with delius staff code: 'STAFF-1', staff identifier: '1' and name: 'Test Person', responsible for managing: 'AAAA12', has unlinked staff record in delius`
      )

      expect(roNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId,
        prisoner,
        responsibleOfficer,
        prison: 'HMP Test',
        notificationType: 'RO_NEW',
        sendingUserName: username,
      })
      expect(eventPublisher.raiseCaseHandover).toHaveBeenCalledWith({
        username,
        bookingId,
        transitionType: 'caToRo',
        submissionTarget: responsibleOfficer,
        source: {
          agencyId: 'LT1',
          type: 'prison',
        },
        target: {
          lduCode: 'code-1',
          probationAreaCode: 'prob-code-1',
          type: 'probation',
        },
      })
      expect(licenceService.markForHandover).toHaveBeenCalledWith(bookingId, 'caToRo')
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })
  })

  test('caToRo adds RO role in delius if have access to delius username', async () => {
    const responsibleOfficer = {
      name: 'Test Person',
      deliusId: 'STAFF-1',
      username: 'username',
      lduCode: 'code-1',
      lduDescription: 'lduDescription-1',
      nomsNumber: 'AAAA12',
      probationAreaCode: 'prob-code-1',
      probationAreaDescription: 'prob-desc-1',
      isUnlinkedAccount: true,
    } as ResponsibleOfficerAndContactDetails

    roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue(responsibleOfficer)

    await roNotificationHandler.sendRo({
      transition: transitionForDestinations.bassReview,
      bookingId,
      token,
      licence,
      prisoner,
      user,
    })

    expect(deliusClient.addResponsibleOfficerRole).toHaveBeenCalledWith('username')
  })

  test('caToRo does not RO role in delius if delius username is not present', async () => {
    const responsibleOfficer = {
      name: 'Test Person',
      deliusId: 'STAFF-1',
      lduCode: 'code-1',
      lduDescription: 'lduDescription-1',
      nomsNumber: 'AAAA12',
      probationAreaCode: 'prob-code-1',
      probationAreaDescription: 'prob-desc-1',
      isUnlinkedAccount: true,
    } as ResponsibleOfficerAndContactDetails

    roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue(responsibleOfficer)

    await roNotificationHandler.sendRo({
      transition: transitionForDestinations.bassReview,
      bookingId,
      token,
      licence,
      prisoner,
      user,
    })

    expect(deliusClient.addResponsibleOfficerRole).not.toHaveBeenCalled()
  })

  describe('sendRoEmail', () => {
    const responsibleOfficer = {
      name: 'Test Person',
      deliusId: 'delius1',
      email: 'ro@user.com',
      lduCode: 'code-1',
      lduDescription: 'lduDescription-1',
      nomsNumber: 'AAAA12',
      probationAreaCode: 'prob-code-1',
      probationAreaDescription: 'prob-desc-1',
    } as ResponsibleOfficerAndContactDetails

    test('handles caToRo', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue(responsibleOfficer)

      const result = await roNotificationHandler.sendRoEmail({
        transition: transitionForDestinations.addressReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(result).toStrictEqual(responsibleOfficer)

      expect(roNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId,
        prisoner,
        responsibleOfficer,
        prison: 'HMP Test',
        notificationType: 'RO_NEW',
        sendingUserName: username,
      })
      expect(eventPublisher.raiseCaseHandover).not.toHaveBeenCalled()
      expect(licenceService.markForHandover).not.toHaveBeenCalled()
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('caToRo when cannot get RO contact details', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue({
        message: 'failed to find RO',
        code: '404',
      })

      const result = await roNotificationHandler.sendRoEmail({
        transition: transitionForDestinations.bassReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(result).toStrictEqual({ message: 'failed to find RO', code: '404' })

      expect(roNotificationSender.sendNotifications).not.toHaveBeenCalled()
      expect(eventPublisher.raiseCaseHandover).not.toHaveBeenCalled()
      expect(licenceService.markForHandover).not.toHaveBeenCalled()
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('caToRo when cannot get prison', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue(responsibleOfficer)
      prisonerService.getEstablishmentForPrisoner.mockResolvedValue(null)

      const result = await roNotificationHandler.sendRoEmail({
        transition: transitionForDestinations.bassReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(result).toStrictEqual({ code: 'MISSING_PRISON', message: 'Missing prison for bookingId: -1' })

      expect(roNotificationSender.sendNotifications).not.toHaveBeenCalled()
      expect(eventPublisher.raiseCaseHandover).not.toHaveBeenCalled()
      expect(licenceService.markForHandover).not.toHaveBeenCalled()
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('caToRo when delius staff records are not linked to user', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue({
        ...responsibleOfficer,
        isUnlinkedAccount: true,
      })

      const result = await roNotificationHandler.sendRoEmail({
        transition: transitionForDestinations.bassReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(result).toStrictEqual({ code: 'STAFF_NOT_LINKED', message: 'User is not linked for bookingId: -1' })

      expect(warningClient.raiseWarning).not.toHaveBeenCalled()
      expect(roNotificationSender.sendNotifications).not.toHaveBeenCalled()
      expect(eventPublisher.raiseCaseHandover).not.toHaveBeenCalled()
      expect(licenceService.markForHandover).not.toHaveBeenCalled()
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('caToRo adds RO role in delius if have access to delius username', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue({
        ...responsibleOfficer,
        username: 'username',
      })

      await roNotificationHandler.sendRoEmail({
        transition: transitionForDestinations.bassReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(deliusClient.addResponsibleOfficerRole).toHaveBeenCalledWith('username')
    })

    test('caToRo does not RO role in delius if delius username is not present', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue({
        ...responsibleOfficer,
        username: undefined,
      })

      await roNotificationHandler.sendRoEmail({
        transition: transitionForDestinations.bassReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(deliusClient.addResponsibleOfficerRole).not.toHaveBeenCalled()
    })
  })
})
