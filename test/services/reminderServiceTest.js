const createReminderService = require('../../server/services/reminderService')

describe('reminderService', () => {
  let service
  let prisonerService
  let deadlineService
  let roNotificationSender

  const transitionDate = '2019-01-01 12:00:00'

  beforeEach(() => {
    prisonerService = {
      getEstablishmentForPrisoner: sinon.stub().resolves({ premise: 'HMP Blah', agencyId: 'LT1' }),
      getOrganisationContactDetails: sinon.stub().resolves({ deliusId: 'delius' }),
      getPrisonerPersonalDetails: sinon
        .stub()
        .resolves({ firstName: 'First', lastName: 'Last', dateOfBirth: '1/1/1', offenderNo: 'AB1234A' }),
      getResponsibleOfficer: sinon.stub().resolves({ deliusId: 'id-1' }),
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

    service = createReminderService(prisonerService, deadlineService, roNotificationSender)
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

    it('should do nothing further if empty notifiable cases', async () => {
      deadlineService.getDueInDays = sinon.stub().resolves()
      deadlineService.getOverdue = sinon.stub().resolves()
      const result = await service.notifyRoReminders('token')

      expect(prisonerService.getOrganisationContactDetails).to.have.callCount(0)
      expect(prisonerService.getPrisonerPersonalDetails).to.have.callCount(0)
      expect(result).to.eql({ overdue: 0, due: 0, soon: 0 })
    })

    it('should do nothing further if no notifiable cases', async () => {
      deadlineService.getDueInDays = sinon.stub().resolves([])
      deadlineService.getOverdue = sinon.stub().resolves([])
      await service.notifyRoReminders('token')

      expect(prisonerService.getOrganisationContactDetails).to.have.callCount(0)
      expect(prisonerService.getPrisonerPersonalDetails).to.have.callCount(0)
    })

    it('should get submissionTarget and prisonerDetails for each notifiable case', async () => {
      await service.notifyRoReminders('token')
      expect(prisonerService.getOrganisationContactDetails).to.have.callCount(4)
      expect(prisonerService.getOrganisationContactDetails).to.be.calledWith('RO', 1, 'token')
      expect(prisonerService.getOrganisationContactDetails).to.be.calledWith('RO', 2, 'token')
      expect(prisonerService.getOrganisationContactDetails).to.be.calledWith('RO', 3, 'token')

      expect(prisonerService.getPrisonerPersonalDetails).to.have.callCount(4)
      expect(prisonerService.getPrisonerPersonalDetails).to.be.calledWith(1, 'token')
      expect(prisonerService.getPrisonerPersonalDetails).to.be.calledWith(2, 'token')
      expect(prisonerService.getPrisonerPersonalDetails).to.be.calledWith(3, 'token')
    })

    it('should call notify client for each notification', async () => {
      await service.notifyRoReminders('token')

      expect(roNotificationSender.sendNotifications).to.have.callCount(4)
      expect(roNotificationSender.sendNotifications).to.be.calledWith({
        bookingId: 2,
        notificationType: 'RO_OVERDUE',
        prisoner: { dateOfBirth: '1/1/1', firstName: 'First', lastName: 'Last', offenderNo: 'AB1234A' },
        sendingUserName: 'NOTIFICATION_SERVICE',
        submissionTarget: { deliusId: 'delius' },
        token: 'token',
        transitionDate: '2019-01-01 12:00:00',
      })

      expect(roNotificationSender.sendNotifications).to.be.calledWith({
        bookingId: 3,
        notificationType: 'RO_OVERDUE',
        prisoner: { dateOfBirth: '1/1/1', firstName: 'First', lastName: 'Last', offenderNo: 'AB1234A' },
        sendingUserName: 'NOTIFICATION_SERVICE',
        submissionTarget: { deliusId: 'delius' },
        token: 'token',
        transitionDate: '2019-01-01 12:00:00',
      })

      expect(roNotificationSender.sendNotifications).to.be.calledWith({
        bookingId: 1,
        notificationType: 'RO_DUE',
        prisoner: { dateOfBirth: '1/1/1', firstName: 'First', lastName: 'Last', offenderNo: 'AB1234A' },
        sendingUserName: 'NOTIFICATION_SERVICE',
        submissionTarget: { deliusId: 'delius' },
        token: 'token',
        transitionDate: '2019-01-01 12:00:00',
      })

      expect(roNotificationSender.sendNotifications).to.be.calledWith({
        bookingId: 1,
        notificationType: 'RO_TWO_DAYS',
        prisoner: { dateOfBirth: '1/1/1', firstName: 'First', lastName: 'Last', offenderNo: 'AB1234A' },
        sendingUserName: 'NOTIFICATION_SERVICE',
        submissionTarget: { deliusId: 'delius' },
        token: 'token',
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
      prisonerService.getOrganisationContactDetails.rejects(new Error('error message'))
      await service.notifyRoReminders('token')

      expect(deadlineService.getOverdue).to.be.calledOnce()
      expect(deadlineService.getDueInDays).to.be.calledTwice()
      expect(deadlineService.getDueInDays).to.be.calledWith('RO', 0)
      expect(deadlineService.getDueInDays).to.be.calledWith('RO', 2)
      expect(prisonerService.getOrganisationContactDetails).to.have.callCount(4)
      expect(prisonerService.getPrisonerPersonalDetails).to.have.callCount(4)
    })
  })
})
