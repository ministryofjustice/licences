const createReminderService = require('../../server/services/reminderService')

describe('reminderService', () => {
  let service
  let prisonerService
  let roContactDetailsService
  let deadlineService
  let roNotificationSender

  const transitionDate = '2019-01-01 12:00:00'

  beforeEach(() => {
    prisonerService = {
      getEstablishmentForPrisoner: sinon.stub().resolves({ premise: 'HMP Blah', agencyId: 'LT1' }),
    }
    roContactDetailsService = {
      getResponsibleOfficerWithContactDetails: sinon.stub().resolves({ deliusId: 'code-1' }),
    }

    deadlineService = {
      getDueInDays: sinon.stub().resolves([{ booking_id: 1, transition_date: transitionDate }]),
      getOverdue: sinon
        .stub()
        .resolves([
          { booking_id: 2, transition_date: transitionDate },
          { booking_id: 3, transition_date: transitionDate },
        ]),
    }

    roNotificationSender = {
      sendNotifications: sinon.stub(),
    }

    service = createReminderService(roContactDetailsService, prisonerService, deadlineService, roNotificationSender)
  })

  describe('notifyRoReminders', () => {
    it('should get notifiable booking IDs from deadline service', async () => {
      await service.notifyRoReminders('token')
      expect(deadlineService.getOverdue).to.be.calledOnce()
      expect(deadlineService.getDueInDays).to.be.calledTwice()
      expect(deadlineService.getDueInDays).to.be.calledWith('RO', 0)
      expect(deadlineService.getDueInDays).to.be.calledWith('RO', 2)
    })

    it('should return counts of notifiable cases', async () => {
      const result = await service.notifyRoReminders('token')
      expect(result).to.eql({ overdue: 2, due: 1, soon: 1 })
    })

    it('should handle when no establishment', async () => {
      prisonerService.getEstablishmentForPrisoner = sinon.stub().resolves(null)
      const result = await service.notifyRoReminders('token')
      expect(result).to.eql({ overdue: 2, due: 1, soon: 1 })
    })

    it('should do nothing further if empty notifiable cases', async () => {
      deadlineService.getDueInDays = sinon.stub().resolves()
      deadlineService.getOverdue = sinon.stub().resolves()
      const result = await service.notifyRoReminders('token')

      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).to.have.callCount(0)
      expect(prisonerService.getEstablishmentForPrisoner).to.have.callCount(0)
      expect(result).to.eql({ overdue: 0, due: 0, soon: 0 })
    })

    it('should do nothing further if no notifiable cases', async () => {
      deadlineService.getDueInDays = sinon.stub().resolves([])
      deadlineService.getOverdue = sinon.stub().resolves([])
      await service.notifyRoReminders('token')

      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).to.have.callCount(0)
      expect(prisonerService.getEstablishmentForPrisoner).to.have.callCount(0)
    })

    it('should get submissionTarget and prisonerDetails for each notifiable case', async () => {
      await service.notifyRoReminders('token')
      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).to.have.callCount(4)
      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).to.be.calledWith(1, 'token')
      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).to.be.calledWith(2, 'token')
      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).to.be.calledWith(3, 'token')

      expect(prisonerService.getEstablishmentForPrisoner).to.have.callCount(4)
      expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith(1, 'token')
      expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith(2, 'token')
      expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith(3, 'token')
    })

    it('should call notify client for each notification', async () => {
      await service.notifyRoReminders('token')

      expect(roNotificationSender.sendNotifications).to.have.callCount(4)
      expect(roNotificationSender.sendNotifications).to.be.calledWith({
        bookingId: 2,
        notificationType: 'RO_OVERDUE',
        prison: 'HMP Blah',
        responsibleOfficer: { deliusId: 'code-1' },
        sendingUserName: 'NOTIFICATION_SERVICE',
        transitionDate: '2019-01-01 12:00:00',
      })

      expect(roNotificationSender.sendNotifications).to.be.calledWith({
        bookingId: 3,
        notificationType: 'RO_OVERDUE',
        prison: 'HMP Blah',
        responsibleOfficer: { deliusId: 'code-1' },
        sendingUserName: 'NOTIFICATION_SERVICE',
        transitionDate: '2019-01-01 12:00:00',
      })

      expect(roNotificationSender.sendNotifications).to.be.calledWith({
        bookingId: 1,
        notificationType: 'RO_DUE',
        prison: 'HMP Blah',
        responsibleOfficer: { deliusId: 'code-1' },
        sendingUserName: 'NOTIFICATION_SERVICE',
        transitionDate: '2019-01-01 12:00:00',
      })

      expect(roNotificationSender.sendNotifications).to.be.calledWith({
        bookingId: 1,
        notificationType: 'RO_TWO_DAYS',
        prison: 'HMP Blah',
        responsibleOfficer: { deliusId: 'code-1' },
        sendingUserName: 'NOTIFICATION_SERVICE',
        transitionDate: '2019-01-01 12:00:00',
      })
    })

    it('should continue with subsequent reminder types even after a failure', async () => {
      deadlineService.getOverdue.rejects(new Error('error message'))
      deadlineService.getDueInDays = sinon.stub().resolves()
      await service.notifyRoReminders('token')

      expect(deadlineService.getOverdue).to.be.calledOnce()
      expect(deadlineService.getDueInDays).to.be.calledTwice()
      expect(deadlineService.getDueInDays).to.be.calledWith('RO', 0)
      expect(deadlineService.getDueInDays).to.be.calledWith('RO', 2)
    })

    it('should continue trying all other notifications even after a failure', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.rejects(new Error('error message'))
      await service.notifyRoReminders('token')

      expect(deadlineService.getOverdue).to.be.calledOnce()
      expect(deadlineService.getDueInDays).to.be.calledTwice()
      expect(deadlineService.getDueInDays).to.be.calledWith('RO', 0)
      expect(deadlineService.getDueInDays).to.be.calledWith('RO', 2)
      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).to.have.callCount(4)
    })

    it('should continue trying all other notifications even after an error happens when searching for offender details', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.resolves({ message: 'some-error' })
      await service.notifyRoReminders('token')

      expect(deadlineService.getOverdue).to.be.calledOnce()
      expect(deadlineService.getDueInDays).to.be.calledTwice()
      expect(deadlineService.getDueInDays).to.be.calledWith('RO', 0)
      expect(deadlineService.getDueInDays).to.be.calledWith('RO', 2)
      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).to.have.callCount(4)
    })
  })
})
