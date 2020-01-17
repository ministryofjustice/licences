const createNotificationService = require('../../../server/services/notifications/notificationService')
const transitionForDestinations = require('../../../server/services/notifications/transitionsForDestinations')

describe('NotificationService', () => {
  let caAndDmNotificationSender
  let audit
  let licenceService
  let prisonerService
  let notificationService
  let roNotificationHandler

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

    roNotificationHandler = {
      sendRo: jest.fn(),
    }

    prisonerService = {
      getEstablishmentForPrisoner: jest.fn().mockReturnValue({ premise: 'HMP Blah', agencyId: 'LT1' }),
      getOrganisationContactDetails: jest.fn().mockReturnValue(submissionTarget),
      getPrisonerPersonalDetails: jest.fn().mockReturnValue(prisoner),
    }

    caAndDmNotificationSender = {
      sendNotifications: jest.fn().mockReturnValue({}),
    }

    audit = {
      record: jest.fn(),
    }

    notificationService = createNotificationService(
      caAndDmNotificationSender,
      audit,
      licenceService,
      prisonerService,
      roNotificationHandler
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
