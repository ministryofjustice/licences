const createNotificationService = require('../../../server/services/notifications/notificationService')
const transitionForDestinations = require('../../../server/services/notifications/transitionsForDestinations')
const { STAFF_NOT_LINKED } = require('../../../server/services/serviceErrors')

describe('NotificationService', () => {
  let roNotificationSender
  let caAndDmNotificationSender
  let audit
  let licenceService
  let prisonerService
  let warningClient
  let notificationService
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

    prisonerService = {
      getEstablishmentForPrisoner: jest.fn().mockReturnValue({ premise: 'HMP Blah', agencyId: 'LT1' }),
      getOrganisationContactDetails: jest.fn().mockReturnValue(submissionTarget),
      getPrisonerPersonalDetails: jest.fn().mockReturnValue(prisoner),
    }

    roNotificationSender = {
      sendNotifications: jest.fn().mockReturnValue({}),
    }

    caAndDmNotificationSender = {
      sendNotifications: jest.fn().mockReturnValue({}),
    }

    audit = {
      record: jest.fn(),
    }

    notificationService = createNotificationService(
      roNotificationSender,
      caAndDmNotificationSender,
      audit,
      licenceService,
      prisonerService,
      roContactDetailsService,
      warningClient
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

      await notificationService.send({
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

      await notificationService.send({
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

      await notificationService.send({
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

      await notificationService.send({
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

      await notificationService.send({
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
        'Staff and user not linked in delius: STAFF-1'
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
      expect(audit.record).toHaveBeenCalledWith('SEND', username, {
        bookingId: -1,
        submissionTarget,
        transitionType: 'roToCa',
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
      expect(audit.record).toHaveBeenCalledWith('SEND', username, {
        bookingId,
        submissionTarget,
        transitionType: 'caToDm',
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
      expect(audit.record).toHaveBeenCalledWith('SEND', username, {
        bookingId,
        submissionTarget,
        transitionType: 'dmToCa',
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
      expect(audit.record).toHaveBeenCalledWith('SEND', username, {
        bookingId: -1,
        submissionTarget,
        transitionType: 'caToDmRefusal',
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
      expect(audit.record).toHaveBeenCalledWith('SEND', username, {
        bookingId,
        submissionTarget,
        transitionType: 'dmToCaReturn',
      })
      expect(licenceService.markForHandover).toHaveBeenCalledWith(bookingId, 'dmToCaReturn')
      expect(licenceService.removeDecision).toHaveBeenCalledWith(bookingId, {})
    })
  })
})
