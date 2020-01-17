const createRoNotificationHandler = require('../../../server/services/notifications/roNotificationHandler')
const transitionForDestinations = require('../../../server/services/notifications/transitionsForDestinations')
const { STAFF_NOT_LINKED } = require('../../../server/services/serviceErrors')

describe('roNotificationHandler', () => {
  let roNotificationSender
  let audit
  let licenceService
  let prisonerService
  let warningClient
  let deliusClient
  let roNotificationHandler
  let roContactDetailsService

  const prisoner = { firstName: 'first', lastName: 'last', dateOfBirth: 'off-dob', offenderNo: 'AB1234A' }
  const submissionTarget = { premise: 'HMP Blah', agencyId: 'LT1', name: 'Something', deliusId: 'delius' }
  const bookingId = -1
  const token = 'token-1'
  const licence = {}
  const username = 'bob'
  const user = { username }

  beforeEach(() => {
    licenceService = {
      markForHandover: jest.fn().mockReturnValue(),
      removeDecision: jest.fn().mockReturnValue({}),
    }

    roContactDetailsService = {
      getResponsibleOfficerWithContactDetails: jest.fn(),
    }

    warningClient = {
      raiseWarning: jest.fn(),
    }

    deliusClient = {
      addResponsibleOfficerRole: jest.fn(),
    }

    prisonerService = {
      getEstablishmentForPrisoner: jest.fn().mockReturnValue({ premise: 'HMP Blah', agencyId: 'LT1' }),
      getOrganisationContactDetails: jest.fn().mockReturnValue(submissionTarget),
      getPrisonerPersonalDetails: jest.fn().mockReturnValue(prisoner),
    }

    roNotificationSender = {
      sendNotifications: jest.fn().mockReturnValue({}),
    }

    audit = {
      record: jest.fn(),
    }

    roNotificationHandler = createRoNotificationHandler(
      roNotificationSender,
      audit,
      licenceService,
      prisonerService,
      roContactDetailsService,
      warningClient,
      deliusClient
    )
  })

  describe('Get send/:destination/:bookingId', () => {
    test('handles caToRo when addressReview is destination', async () => {
      const responsibleOfficer = {
        name: 'Jo Smith',
        deliusId: 'delius1',
        email: 'ro@user.com',
        lduCode: 'code-1',
        lduDescription: 'lduDescription-1',
        nomsNumber: 'AAAA12',
        probationAreaCode: 'prob-code-1',
        probationAreaDescription: 'prob-desc-1',
      }
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
        responsibleOfficer,
        prison: 'HMP Blah',
        notificationType: 'RO_NEW',
        sendingUserName: username,
      })
      expect(audit.record).toHaveBeenCalledWith('SEND', username, {
        bookingId,
        submissionTarget: responsibleOfficer,
        transitionType: 'caToRo',
      })
      expect(licenceService.markForHandover).toHaveBeenCalledWith(bookingId, 'caToRo')
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('handles caToRo when bassReview is destination', async () => {
      const responsibleOfficer = {
        name: 'Jo Smith',
        deliusId: 'delius1',
        email: 'ro@user.com',
        lduCode: 'code-1',
        lduDescription: 'lduDescription-1',
        nomsNumber: 'AAAA12',
        probationAreaCode: 'prob-code-1',
        probationAreaDescription: 'prob-desc-1',
      }
      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue(responsibleOfficer)

      await roNotificationHandler.sendRo({
        transition: transitionForDestinations.bassReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(roNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId,
        responsibleOfficer,
        prison: 'HMP Blah',
        notificationType: 'RO_NEW',
        sendingUserName: username,
      })
      expect(audit.record).toHaveBeenCalledWith('SEND', username, {
        bookingId,
        submissionTarget: responsibleOfficer,
        transitionType: 'caToRo',
      })
      expect(licenceService.markForHandover).toHaveBeenCalledWith(bookingId, 'caToRo')
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('caToRo when cannot get RO contact details', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue({
        message: 'failed to find RO',
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
      expect(audit.record).not.toHaveBeenCalled()
      expect(licenceService.markForHandover).not.toHaveBeenCalled()
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('caToRo when cannot get prison', async () => {
      const responsibleOfficer = {
        name: 'Jo Smith',
        deliusId: 'delius1',
        email: 'ro@user.com',
        lduCode: 'code-1',
        lduDescription: 'lduDescription-1',
        nomsNumber: 'AAAA12',
        probationAreaCode: 'prob-code-1',
        probationAreaDescription: 'prob-desc-1',
      }
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
      expect(audit.record).not.toHaveBeenCalled()
      expect(licenceService.markForHandover).not.toHaveBeenCalled()
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })

    test('caToRo when delius staff records are not linked to user', async () => {
      const responsibleOfficer = {
        name: 'Jo Smith',
        deliusId: 'STAFF-1',
        lduCode: 'code-1',
        lduDescription: 'lduDescription-1',
        nomsNumber: 'AAAA12',
        probationAreaCode: 'prob-code-1',
        probationAreaDescription: 'prob-desc-1',
        isUnlinkedAccount: true,
      }

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
        `RO with delius staff code: 'STAFF-1' and name: 'Jo Smith', responsible for managing: 'AAAA12', has unlinked staff record in delius`
      )

      expect(roNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId,
        responsibleOfficer,
        prison: 'HMP Blah',
        notificationType: 'RO_NEW',
        sendingUserName: username,
      })
      expect(audit.record).toHaveBeenCalledWith('SEND', username, {
        bookingId,
        submissionTarget: responsibleOfficer,
        transitionType: 'caToRo',
      })
      expect(licenceService.markForHandover).toHaveBeenCalledWith(bookingId, 'caToRo')
      expect(licenceService.removeDecision).not.toHaveBeenCalled()
    })
  })

  test('caToRo adds RO role in delius if have access to delius username', async () => {
    const responsibleOfficer = {
      name: 'Jo Smith',
      deliusId: 'STAFF-1',
      username: 'userBob',
      lduCode: 'code-1',
      lduDescription: 'lduDescription-1',
      nomsNumber: 'AAAA12',
      probationAreaCode: 'prob-code-1',
      probationAreaDescription: 'prob-desc-1',
      isUnlinkedAccount: true,
    }

    roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue(responsibleOfficer)

    await roNotificationHandler.sendRo({
      transition: transitionForDestinations.bassReview,
      bookingId,
      token,
      licence,
      prisoner,
      user,
    })

    expect(deliusClient.addResponsibleOfficerRole).toHaveBeenCalledWith('userBob')
  })

  test('caToRo does not RO role in delius if delius username is not present', async () => {
    const responsibleOfficer = {
      name: 'Jo Smith',
      deliusId: 'STAFF-1',
      lduCode: 'code-1',
      lduDescription: 'lduDescription-1',
      nomsNumber: 'AAAA12',
      probationAreaCode: 'prob-code-1',
      probationAreaDescription: 'prob-desc-1',
      isUnlinkedAccount: true,
    }

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
})
