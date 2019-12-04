const createNotificationService = require('../../../server/services/notifications/notificationService')
const transitionForDestinations = require('../../../server/services/notifications/transitionsForDestinations')

describe('NotificationService', () => {
  let roNotificationSender
  let caAndDmNotificationSender
  let audit
  let licenceService
  let prisonerService
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
      markForHandover: sinon.stub().resolves(),
      removeDecision: sinon.stub().resolves({}),
    }

    roContactDetailsService = {
      getResponsibleOfficerWithContactDetails: sinon.stub(),
    }
    prisonerService = {
      getEstablishmentForPrisoner: sinon.stub().resolves({ premise: 'HMP Blah', agencyId: 'LT1' }),
      getOrganisationContactDetails: sinon.stub().resolves(submissionTarget),
      getPrisonerPersonalDetails: sinon.stub().resolves(prisoner),
    }

    roNotificationSender = {
      sendNotifications: sinon.stub().resolves({}),
    }

    caAndDmNotificationSender = {
      sendNotifications: sinon.stub().resolves({}),
    }

    audit = {
      record: sinon.stub(),
    }

    notificationService = createNotificationService(
      roNotificationSender,
      caAndDmNotificationSender,
      audit,
      licenceService,
      prisonerService,
      roContactDetailsService
    )
  })

  describe('Get send/:destination/:bookingId', () => {
    it('handles caToRo when addressReview is destination', async () => {
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
      roContactDetailsService.getResponsibleOfficerWithContactDetails.resolves(responsibleOfficer)

      await notificationService.send({
        transition: transitionForDestinations.addressReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(roNotificationSender.sendNotifications).to.be.calledWith({
        bookingId,
        responsibleOfficer,
        prison: 'HMP Blah',
        notificationType: 'RO_NEW',
        sendingUserName: username,
      })
      expect(audit.record).to.be.calledWith('SEND', username, {
        bookingId,
        submissionTarget: responsibleOfficer,
        transitionType: 'caToRo',
      })
      expect(licenceService.markForHandover).to.be.calledWith(bookingId, 'caToRo')
      expect(licenceService.removeDecision).not.to.be.called()
    })

    it('handles caToRo when bassReview is destination', async () => {
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
      roContactDetailsService.getResponsibleOfficerWithContactDetails.resolves(responsibleOfficer)

      await notificationService.send({
        transition: transitionForDestinations.bassReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(roNotificationSender.sendNotifications).to.be.calledWith({
        bookingId,
        responsibleOfficer,
        prison: 'HMP Blah',
        notificationType: 'RO_NEW',
        sendingUserName: username,
      })
      expect(audit.record).to.be.calledWith('SEND', username, {
        bookingId,
        submissionTarget: responsibleOfficer,
        transitionType: 'caToRo',
      })
      expect(licenceService.markForHandover).to.be.calledWith(bookingId, 'caToRo')
      expect(licenceService.removeDecision).not.to.be.called()
    })

    it('caToRo when cannot get RO contact details', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.resolves({ message: 'failed to find RO' })

      await notificationService.send({
        transition: transitionForDestinations.bassReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(roNotificationSender.sendNotifications).not.to.be.called()
      expect(audit.record).not.to.be.called()
      expect(licenceService.markForHandover).not.to.be.called()
      expect(licenceService.removeDecision).not.to.be.called()
    })

    it('caToRo when cannot get prison', async () => {
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
      roContactDetailsService.getResponsibleOfficerWithContactDetails.resolves(responsibleOfficer)
      prisonerService.getEstablishmentForPrisoner.resolves({})

      await notificationService.send({
        transition: transitionForDestinations.bassReview,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(roNotificationSender.sendNotifications).not.to.be.called()
      expect(audit.record).not.to.be.called()
      expect(licenceService.markForHandover).not.to.be.called()
      expect(licenceService.removeDecision).not.to.be.called()
    })

    it('handles roToCa when finalChecks is destination', async () => {
      await notificationService.send({
        transition: transitionForDestinations.finalChecks,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(caAndDmNotificationSender.sendNotifications).to.be.calledWith({
        bookingId,
        notificationType: 'CA_RETURN',
        prisoner,
        sendingUserName: username,
        submissionTarget,
        token,
      })
      expect(audit.record).to.be.calledWith('SEND', username, {
        bookingId: -1,
        submissionTarget,
        transitionType: 'roToCa',
      })
      expect(licenceService.markForHandover).to.be.calledWith(bookingId, 'roToCa')
      expect(licenceService.removeDecision).not.to.be.called()
    })

    it('handles caToDm when approval is destination', async () => {
      await notificationService.send({
        transition: transitionForDestinations.approval,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(caAndDmNotificationSender.sendNotifications).to.be.calledWith({
        bookingId,
        notificationType: 'DM_NEW',
        prisoner,
        sendingUserName: username,
        submissionTarget,
        token,
      })
      expect(audit.record).to.be.calledWith('SEND', username, {
        bookingId,
        submissionTarget,
        transitionType: 'caToDm',
      })
      expect(licenceService.markForHandover).to.be.calledWith(bookingId, 'caToDm')
      expect(licenceService.removeDecision).not.to.be.called()
    })

    it('handles dmToCa when decided is destination', async () => {
      await notificationService.send({
        transition: transitionForDestinations.decided,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(caAndDmNotificationSender.sendNotifications).to.be.calledWith({
        bookingId,
        notificationType: 'CA_DECISION',
        prisoner,
        sendingUserName: username,
        submissionTarget,
        token,
      })
      expect(audit.record).to.be.calledWith('SEND', username, {
        bookingId,
        submissionTarget,
        transitionType: 'dmToCa',
      })
      expect(licenceService.markForHandover).to.be.calledWith(bookingId, 'dmToCa')
      expect(licenceService.removeDecision).not.to.be.called()
    })

    it('handles caToDmRefusal when refusal is destination', async () => {
      await notificationService.send({
        transition: transitionForDestinations.refusal,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(caAndDmNotificationSender.sendNotifications).to.be.calledWith({
        bookingId,
        notificationType: 'DM_NEW',
        prisoner,
        sendingUserName: username,
        submissionTarget,
        token,
      })
      expect(audit.record).to.be.calledWith('SEND', username, {
        bookingId: -1,
        submissionTarget,
        transitionType: 'caToDmRefusal',
      })
      expect(licenceService.markForHandover).to.be.calledWith(bookingId, 'caToDmRefusal')
      expect(licenceService.removeDecision).not.to.be.called()
    })

    it('handles dmToCaReturn when return is destination', async () => {
      await notificationService.send({
        transition: transitionForDestinations.return,
        bookingId,
        token,
        licence,
        prisoner,
        user,
      })

      expect(caAndDmNotificationSender.sendNotifications).to.be.calledWith({
        bookingId,
        notificationType: 'DM_TO_CA_RETURN',
        prisoner,
        sendingUserName: username,
        submissionTarget,
        token,
      })
      expect(audit.record).to.be.calledWith('SEND', username, {
        bookingId,
        submissionTarget,
        transitionType: 'dmToCaReturn',
      })
      expect(licenceService.markForHandover).to.be.calledWith(bookingId, 'dmToCaReturn')
      expect(licenceService.removeDecision).to.be.calledWith(bookingId)
    })
  })
})
