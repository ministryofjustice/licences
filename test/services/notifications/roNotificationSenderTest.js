const createSendRoNotifications = require('../../../server/services/notifications/roNotificationSender')

describe('sendRoNotifications', () => {
  let service
  let prisonerService
  let roContactDetailsService
  let notificationSender
  let config

  beforeEach(() => {
    config = {
      notifications: {
        notifyKey: 'dummy-key',
        clearingOfficeEmail: 'HDC.ClearingOffice@justice.gov.uk',
        clearingOfficeEmailEnabled: 'YES',
        activeNotificationTypes: [
          'CA_RETURN',
          'CA_DECISION',
          'RO_NEW',
          'RO_TWO_DAYS',
          'RO_DUE',
          'RO_OVERDUE',
          'DM_NEW',
          'DM_TO_CA_RETURN',
        ],
      },
      domain: 'http://localhost:3000',
    }

    prisonerService = {
      getEstablishmentForPrisoner: sinon.stub().resolves({ premise: 'HMP Blah', agencyId: 'LT1' }),
      getOrganisationContactDetails: sinon.stub().resolves({ deliusId: 'delius' }),
      getPrisonerPersonalDetails: sinon
        .stub()
        .resolves({ firstName: 'First', lastName: 'Last', dateOfBirth: '1/1/1', offenderNo: 'AB1234A' }),
      getResponsibleOfficer: sinon.stub().resolves({ deliusId: 'id-1' }),
    }
    roContactDetailsService = {
      getContactDetails: sinon.stub().resolves({
        orgEmail: 'admin@ro.email',
        email: 'ro@ro.email',
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
      }),
    }
    notificationSender = {
      notify: sinon.stub().resolves({}),
    }

    service = createSendRoNotifications(prisonerService, roContactDetailsService, notificationSender, config)
  })

  describe('getNotifications', () => {
    const prisoner = { firstName: 'First', lastName: 'Last', dateOfBirth: '1/1/1', offenderNo: 'AB1234A' }
    const expectedCommonData = {
      booking_id: '123',
      offender_dob: '1/1/1',
      offender_name: 'First Last',
      offender_noms: 'AB1234A',
      domain: 'http://localhost:3000',
    }

    describe('RO notification data', () => {
      let clock

      beforeEach(() => {
        clock = sinon.useFakeTimers(new Date('March 11, 2019 14:59:59').getTime())
      })

      afterEach(() => {
        clock.restore()
      })

      it('should return empty when missing COM delius ID', async () => {
        roContactDetailsService.getContactDetails = sinon.stub().resolves({ orgEmail: '' })
        const data = await service.getNotifications({
          prisoner: {},
          submissionTarget: { deliusId: '' },
          notificationConfig: service.notificationTypes.RO_NEW,
        })

        expect(data).to.eql([])
      })

      it('should return empty when missing COM', async () => {
        roContactDetailsService.getContactDetails = sinon.stub().resolves(null)
        const data = await service.getNotifications({
          prisoner: {},
          submissionTarget: { deliusId: 'deliusId' },
          notificationConfig: service.notificationTypes.RO_NEW,
        })

        expect(data).to.eql([])
      })

      it('should return empty when missing RO orgEmail', async () => {
        roContactDetailsService.getContactDetails = sinon.stub().resolves({ orgEmail: '', email: '' })
        const data = await service.getNotifications({
          prisoner: {},
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          notificationConfig: service.notificationTypes.RO_NEW,
        })

        expect(data).to.eql([])
      })

      it('should return empty when no contact details present', async () => {
        roContactDetailsService.getContactDetails = sinon.stub().resolves(null)
        const data = await service.getNotifications({
          prisoner: {},
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          notificationConfig: service.notificationTypes.RO_NEW,
        })

        expect(data).to.eql([])
      })

      it('should throw if error in API calls', async () => {
        prisonerService.getEstablishmentForPrisoner.rejects(new Error('dead'))

        expect(
          service.getNotifications({
            prisoner: {},
            submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
            notificationConfig: service.notificationTypes.RO_NEW,
          })
        ).to.be.rejected()
      })

      it('should generate RO notification data', async () => {
        const data = await service.getNotifications({
          prisoner,
          token: 'token',
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          bookingId: '123',
          sendingUserName: 'sender',
          notificationConfig: service.notificationTypes.RO_NEW,
        })

        expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce()
        expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith('123', 'token')
        expect(roContactDetailsService.getContactDetails).to.be.calledOnce()
        expect(roContactDetailsService.getContactDetails).to.be.calledWith('deliusId')

        expect(data).to.eql([
          {
            email: 'ro@ro.email',
            templateName: 'RO_NEW',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
          {
            email: 'admin@ro.email',
            templateName: 'RO_NEW_COPY',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
          {
            email: config.notifications.clearingOfficeEmail,
            templateName: 'RO_NEW_COPY',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
        ])
      })

      it('should generate RO notification data for RO_TWO_DAYS', async () => {
        const data = await service.getNotifications({
          prisoner,
          token: 'token',
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          bookingId: '123',
          sendingUserName: 'sender',
          notificationConfig: service.notificationTypes.RO_TWO_DAYS,
        })

        expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce()
        expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith('123', 'token')
        expect(roContactDetailsService.getContactDetails).to.be.calledOnce()
        expect(roContactDetailsService.getContactDetails).to.be.calledWith('deliusId')

        expect(data).to.eql([
          {
            email: 'ro@ro.email',
            templateName: 'RO_TWO_DAYS',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
          {
            email: 'admin@ro.email',
            templateName: 'RO_TWO_DAYS_COPY',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
        ])
      })

      it('should generate RO notification data for RO_DUE', async () => {
        const data = await service.getNotifications({
          prisoner,
          token: 'token',
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          bookingId: '123',
          sendingUserName: 'sender',
          notificationConfig: service.notificationTypes.RO_DUE,
        })

        expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce()
        expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith('123', 'token')
        expect(roContactDetailsService.getContactDetails).to.be.calledOnce()
        expect(roContactDetailsService.getContactDetails).to.be.calledWith('deliusId')

        expect(data).to.eql([
          {
            email: 'ro@ro.email',
            templateName: 'RO_DUE',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
          {
            email: 'admin@ro.email',
            templateName: 'RO_DUE_COPY',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
        ])
      })

      it('should generate RO notification data when RO_OVERDUE', async () => {
        const data = await service.getNotifications({
          prisoner,
          token: 'token',
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          bookingId: '123',
          sendingUserName: 'sender',
          notificationConfig: service.notificationTypes.RO_OVERDUE,
        })

        expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce()
        expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith('123', 'token')
        expect(roContactDetailsService.getContactDetails).to.be.calledOnce()
        expect(roContactDetailsService.getContactDetails).to.be.calledWith('deliusId')

        expect(data).to.eql([
          {
            email: 'ro@ro.email',
            templateName: 'RO_OVERDUE',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
          {
            email: 'admin@ro.email',
            templateName: 'RO_OVERDUE_COPY',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
          {
            email: config.notifications.clearingOfficeEmail,
            templateName: 'RO_OVERDUE_COPY',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
        ])
      })

      it('should generate RO notification data when no email', async () => {
        roContactDetailsService.getContactDetails = sinon.stub().resolves({
          orgEmail: 'admin@ro.email',
          email: '',
          organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
        })

        const data = await service.getNotifications({
          prisoner,
          token: 'token',
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          bookingId: '123',
          sendingUserName: 'sender',
          notificationConfig: service.notificationTypes.RO_NEW,
        })

        expect(data).to.eql([
          {
            email: 'admin@ro.email',
            templateName: 'RO_NEW_COPY',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
          {
            email: config.notifications.clearingOfficeEmail,
            templateName: 'RO_NEW_COPY',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
        ])
      })

      it('should generate RO notification data when no orgEmail', async () => {
        roContactDetailsService.getContactDetails = sinon.stub().resolves({
          orgEmail: '',
          email: 'ro@ro.email',
          organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
        })

        const data = await service.getNotifications({
          prisoner,
          token: 'token',
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          bookingId: '123',
          sendingUserName: 'sender',
          notificationConfig: service.notificationTypes.RO_NEW,
        })

        expect(data).to.eql([
          {
            email: 'ro@ro.email',
            templateName: 'RO_NEW',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
          {
            email: config.notifications.clearingOfficeEmail,
            templateName: 'RO_NEW_COPY',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
        ])
      })

      it('should no generate RO clearing office notification data if the co email is disabled', async () => {
        config.notifications.clearingOfficeEmailEnabled = 'No'
        service = createSendRoNotifications(prisonerService, roContactDetailsService, notificationSender, config)

        roContactDetailsService.getContactDetails = sinon.stub().resolves({
          orgEmail: '',
          email: 'ro@ro.email',
          organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
        })

        const data = await service.getNotifications({
          prisoner,
          token: 'token',
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          bookingId: '123',
          sendingUserName: 'sender',
          notificationConfig: service.notificationTypes.RO_NEW,
        })

        expect(data).to.eql([
          {
            email: 'ro@ro.email',
            templateName: 'RO_NEW',
            personalisation: {
              ...expectedCommonData,
              prison: 'HMP Blah',
              ro_name: 'RO Name',
              date: 'Monday 25th March',
              organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
            },
          },
        ])
      })
    })
  })

  describe('sendNotifications', () => {
    it('Should not error if internal errors, just return empty', async () => {
      prisonerService.getEstablishmentForPrisoner.rejects(new Error('dead'))
      const inputs = {
        prisoner: {},
        notificationType: 'RO_NEW',
        submissionTarget: {},
        bookingId: {},
        sendingUserName: {},
        token: {},
      }

      const result = await service.sendNotifications(inputs)
      expect(result).to.eql([])
    })
  })
})
