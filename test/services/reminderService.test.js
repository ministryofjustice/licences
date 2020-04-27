const createReminderService = require('../../server/services/reminderService')
const { createPrisonerServiceStub } = require('../mockServices')

describe('reminderService', () => {
  let service
  let prisonerService
  let roContactDetailsService
  let deadlineService
  let roNotificationSender

  const transitionDate = '2019-01-01 12:00:00'

  beforeEach(() => {
    prisonerService = createPrisonerServiceStub()
    prisonerService.getEstablishmentForPrisoner.mockReturnValue({ premise: 'HMP Blah', agencyId: 'LT1' })

    roContactDetailsService = {
      getFunctionalMailBox: jest.fn(),
      getResponsibleOfficerWithContactDetails: jest.fn().mockReturnValue({ deliusId: 'code-1' }),
    }

    deadlineService = {
      getDueInDays: jest.fn().mockReturnValue([{ booking_id: 1, transition_date: transitionDate }]),
      getOverdue: jest.fn().mockResolvedValue([
        { booking_id: 2, transition_date: transitionDate },
        { booking_id: 3, transition_date: transitionDate },
      ]),
    }

    roNotificationSender = {
      sendNotifications: jest.fn(),
      notificationTypes: jest.fn(),
      getNotifications: jest.fn(),
    }

    service = createReminderService(roContactDetailsService, prisonerService, deadlineService, roNotificationSender, [
      'RO_OVERDUE',
      'RO_DUE',
      'RO_TWO_DAYS',
    ])
  })

  describe('notifyRoReminders', () => {
    test('should not send notifications if disabled', async () => {
      service = createReminderService(
        roContactDetailsService,
        prisonerService,
        deadlineService,
        roNotificationSender,
        []
      )

      const result = await service.notifyRoReminders('token')
      expect(result).toEqual({ overdue: 0, due: 0, soon: 0 })
    })

    test('allows selective disabling of notifications', async () => {
      service = createReminderService(roContactDetailsService, prisonerService, deadlineService, roNotificationSender, [
        'RO_TWO_DAYS',
      ])

      const result = await service.notifyRoReminders('token')
      expect(result).toEqual({ overdue: 0, due: 0, soon: 1 })
    })

    test('should get notifiable booking IDs from deadline service', async () => {
      await service.notifyRoReminders('token')
      expect(deadlineService.getOverdue).toHaveBeenCalled()
      expect(deadlineService.getDueInDays).toHaveBeenCalledTimes(2)
      expect(deadlineService.getDueInDays).toHaveBeenCalledWith('RO', 0)
      expect(deadlineService.getDueInDays).toHaveBeenCalledWith('RO', 2)
    })

    test('should return counts of notifiable cases', async () => {
      const result = await service.notifyRoReminders('token')
      expect(result).toEqual({ overdue: 2, due: 1, soon: 1 })
    })

    test('should handle when no establishment', async () => {
      prisonerService.getEstablishmentForPrisoner = jest.fn().mockReturnValue(null)
      const result = await service.notifyRoReminders('token')
      expect(result).toEqual({ overdue: 2, due: 1, soon: 1 })
    })

    test('should do nothing further if empty notifiable cases', async () => {
      deadlineService.getDueInDays = jest.fn()
      deadlineService.getOverdue = jest.fn()
      const result = await service.notifyRoReminders('token')

      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).toHaveBeenCalledTimes(0)
      expect(prisonerService.getEstablishmentForPrisoner).toHaveBeenCalledTimes(0)
      expect(result).toEqual({ overdue: 0, due: 0, soon: 0 })
    })

    test('should do nothing further if no notifiable cases', async () => {
      deadlineService.getDueInDays = jest.fn().mockReturnValue([])
      deadlineService.getOverdue = jest.fn().mockReturnValue([])
      await service.notifyRoReminders('token')

      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).toHaveBeenCalledTimes(0)
      expect(prisonerService.getEstablishmentForPrisoner).toHaveBeenCalledTimes(0)
    })

    test('should get submissionTarget and prisonerDetails for each notifiable case', async () => {
      await service.notifyRoReminders('token')
      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).toHaveBeenCalledTimes(4)
      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).toHaveBeenCalledWith(1, 'token')
      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).toHaveBeenCalledWith(2, 'token')
      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).toHaveBeenCalledWith(3, 'token')

      expect(prisonerService.getEstablishmentForPrisoner).toHaveBeenCalledTimes(4)
      expect(prisonerService.getEstablishmentForPrisoner).toHaveBeenCalledWith(1, 'token')
      expect(prisonerService.getEstablishmentForPrisoner).toHaveBeenCalledWith(2, 'token')
      expect(prisonerService.getEstablishmentForPrisoner).toHaveBeenCalledWith(3, 'token')
    })

    test('should call notify client for each notification', async () => {
      await service.notifyRoReminders('token')

      expect(roNotificationSender.sendNotifications).toHaveBeenCalledTimes(4)
      expect(roNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId: 2,
        notificationType: 'RO_OVERDUE',
        prison: 'HMP Blah',
        responsibleOfficer: { deliusId: 'code-1' },
        sendingUserName: 'NOTIFICATION_SERVICE',
        transitionDate: '2019-01-01 12:00:00',
      })

      expect(roNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId: 3,
        notificationType: 'RO_OVERDUE',
        prison: 'HMP Blah',
        responsibleOfficer: { deliusId: 'code-1' },
        sendingUserName: 'NOTIFICATION_SERVICE',
        transitionDate: '2019-01-01 12:00:00',
      })

      expect(roNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId: 1,
        notificationType: 'RO_DUE',
        prison: 'HMP Blah',
        responsibleOfficer: { deliusId: 'code-1' },
        sendingUserName: 'NOTIFICATION_SERVICE',
        transitionDate: '2019-01-01 12:00:00',
      })

      expect(roNotificationSender.sendNotifications).toHaveBeenCalledWith({
        bookingId: 1,
        notificationType: 'RO_TWO_DAYS',
        prison: 'HMP Blah',
        responsibleOfficer: { deliusId: 'code-1' },
        sendingUserName: 'NOTIFICATION_SERVICE',
        transitionDate: '2019-01-01 12:00:00',
      })
    })

    test('should continue with subsequent reminder types even after a failure', async () => {
      deadlineService.getOverdue.mockRejectedValue(new Error('error message'))
      deadlineService.getDueInDays = jest.fn()
      await service.notifyRoReminders('token')

      expect(deadlineService.getOverdue).toHaveBeenCalled()
      expect(deadlineService.getDueInDays).toHaveBeenCalledTimes(2)
      expect(deadlineService.getDueInDays).toHaveBeenCalledWith('RO', 0)
      expect(deadlineService.getDueInDays).toHaveBeenCalledWith('RO', 2)
    })

    test('should continue trying all other notifications even after a failure', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockRejectedValue(new Error('error message'))
      await service.notifyRoReminders('token')

      expect(deadlineService.getOverdue).toHaveBeenCalled()
      expect(deadlineService.getDueInDays).toHaveBeenCalledTimes(2)
      expect(deadlineService.getDueInDays).toHaveBeenCalledWith('RO', 0)
      expect(deadlineService.getDueInDays).toHaveBeenCalledWith('RO', 2)
      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).toHaveBeenCalledTimes(4)
    })

    test('should continue trying all other notifications even after an error happens when searching for offender details', async () => {
      roContactDetailsService.getResponsibleOfficerWithContactDetails.mockResolvedValue({ message: 'some-error' })
      await service.notifyRoReminders('token')

      expect(deadlineService.getOverdue).toHaveBeenCalled()
      expect(deadlineService.getDueInDays).toHaveBeenCalledTimes(2)
      expect(deadlineService.getDueInDays).toHaveBeenCalledWith('RO', 0)
      expect(deadlineService.getDueInDays).toHaveBeenCalledWith('RO', 2)
      expect(roContactDetailsService.getResponsibleOfficerWithContactDetails).toHaveBeenCalledTimes(4)
    })
  })
})
