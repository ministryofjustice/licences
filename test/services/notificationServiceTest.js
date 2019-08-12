const createNotificationService = require('../../server/services/notificationService')
const templates = require('../../server/services/config/notificationTemplates')

describe('notificationService', () => {
  let service
  let prisonerService
  let userAdminService
  let deadlineService
  let configClient
  let notifyClient
  let audit
  let nomisClient
  let config

  const transitionDate = '2019-01-01 12:00:00'

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
    }
    userAdminService = {
      getRoUserByDeliusId: sinon.stub().resolves({
        orgEmail: 'admin@ro.email',
        email: 'ro@ro.email',
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
      }),
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
    configClient = {
      getMailboxes: sinon
        .stub()
        .resolves([
          { email: 'test1@email.address', name: 'Name One' },
          { email: 'test2@email.address', name: 'Name Two' },
        ]),
    }
    notifyClient = {
      sendEmail: sinon.stub().resolves({}),
    }
    audit = {
      record: sinon.stub().resolves({}),
    }

    nomisClient = {
      getEstablishment: sinon.stub().resolves({
        description: 'Moorland (HMP & YOI)',
        agencyId: 'MDI',
        agencyType: 'INST',
        addressType: 'BUS',
        premise: 'Moorland (HMP & YOI)',
        locality: 'Yorkshire',
        city: 'Doncaster',
        country: 'England',
        postCode: 'PE6 1BF',
        phones: [
          {
            number: '484 555 6431',
            type: 'BUS',
          },
        ],
      }),
    }
    const nomisClientBuilder = sinon.stub().returns(nomisClient)

    service = createNotificationService(
      prisonerService,
      userAdminService,
      deadlineService,
      configClient,
      notifyClient,
      audit,
      nomisClientBuilder,
      config
    )
  })

  describe('notify', () => {
    it('should do nothing if template ID not in active template list', async () => {
      const notifications = [{ email: ['email@email.com'] }]
      await service.notify({
        sendingUserName: 'username',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).not.to.be.calledOnce()
    })

    it('should do nothing if empty data', async () => {
      const notifications = [{}]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).not.to.be.calledOnce()
    })

    it('should do nothing if empty emails', async () => {
      const notifications = [{ email: [] }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).not.to.be.calledOnce()
    })

    it('should call sendEmail from notifyClient', async () => {
      const notifications = [{ email: 'email@email.com', templateName: 'CA_RETURN' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).to.be.calledOnce()
    })

    it('should pass in the template id', async () => {
      const notifications = [
        { email: 'email@email.com', templateName: 'CA_RETURN' },
        { email: 'email@email.com', templateName: 'CA_RETURN_COPY' },
        { email: 'email@email.com', templateName: 'CA_DECISION' },
        { email: 'email@email.com', templateName: 'RO_NEW' },
        { email: 'email@email.com', templateName: 'RO_NEW_COPY' },
        { email: 'email@email.com', templateName: 'RO_TWO_DAYS' },
        { email: 'email@email.com', templateName: 'RO_TWO_DAYS_COPY' },
        { email: 'email@email.com', templateName: 'RO_DUE' },
        { email: 'email@email.com', templateName: 'RO_DUE_COPY' },
        { email: 'email@email.com', templateName: 'RO_OVERDUE' },
        { email: 'email@email.com', templateName: 'RO_OVERDUE_COPY' },
        { email: 'email@email.com', templateName: 'DM_NEW' },
      ]

      await service.notify({ user: 'username', notificationType: 'CA_RETURN', bookingId: 123, notifications })

      expect(notifyClient.sendEmail).to.be.calledWith(templates.CA_RETURN.templateId, sinon.match.any, sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.CA_RETURN_COPY.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.CA_DECISION.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(templates.RO_NEW.templateId, sinon.match.any, sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.RO_NEW_COPY.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.RO_TWO_DAYS.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.RO_TWO_DAYS_COPY.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(templates.RO_DUE.templateId, sinon.match.any, sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.RO_DUE_COPY.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(templates.RO_OVERDUE.templateId, sinon.match.any, sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(
        templates.RO_OVERDUE_COPY.templateId,
        sinon.match.any,
        sinon.match.any
      )
      expect(notifyClient.sendEmail).to.be.calledWith(templates.DM_NEW.templateId, sinon.match.any, sinon.match.any)
    })

    it('should pass in the email address', async () => {
      const notifications = [{ email: 'email@email.com', templateName: 'CA_RETURN' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, 'email@email.com', sinon.match.any)
    })

    it('should pass in the data', async () => {
      const notifications = [{ personalisation: { a: 'a' }, email: ['email@email.com'], templateName: 'CA_RETURN' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, sinon.match.any, { personalisation: { a: 'a' } })
    })

    it('should audit the event', async () => {
      const notifications = [{ personalisation: { a: 'a' }, email: 'email@email.com' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(audit.record).to.be.calledOnce()
      expect(audit.record).to.be.calledWith('NOTIFY', 'username', {
        bookingId: 123,
        notificationType: 'CA_RETURN',
        notifications,
      })
    })

    it('should call sendEmail from notifyClient once for each email', async () => {
      const notifications = [
        { email: '1@1.com', templateName: 'CA_RETURN' },
        { email: '2@2.com', templateName: 'CA_RETURN_COPY' },
        { email: '3@3.com', templateName: 'CA_RETURN' },
      ]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(notifyClient.sendEmail).to.be.calledThrice()
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, '1@1.com', sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, '2@2.com', sinon.match.any)
      expect(notifyClient.sendEmail).to.be.calledWith(sinon.match.any, '3@3.com', sinon.match.any)
    })

    it('should audit the event only once when multiple email addresses', async () => {
      const notifications = [{ email: '1@1.com' }, { email: '2@2.com' }, { email: '3@3.com' }]
      await service.notify({
        sendingUserName: 'username',
        notificationType: 'CA_RETURN',
        bookingId: 123,
        notifications,
      })
      expect(audit.record).to.be.calledOnce()
      expect(audit.record).to.be.calledWith('NOTIFY', 'username', {
        bookingId: 123,
        notificationType: 'CA_RETURN',
        notifications,
      })
    })
  })

  describe('getNotificationData', () => {
    const prisoner = { firstName: 'First', lastName: 'Last', dateOfBirth: '1/1/1', offenderNo: 'AB1234A' }
    const expectedCommonData = {
      booking_id: '123',
      offender_dob: '1/1/1',
      offender_name: 'First Last',
      offender_noms: 'AB1234A',
      domain: 'http://localhost:3000',
    }

    it('should return empty when unknown notification type', async () => {
      const data = await service.getNotificationData({
        prisoner: {},
        notificationType: 'UNKNOWN',
      })

      expect(data).to.eql([])
    })

    describe('RO notification data', () => {
      let clock

      beforeEach(() => {
        clock = sinon.useFakeTimers(new Date('March 11, 2019 14:59:59').getTime())
      })

      afterEach(() => {
        clock.restore()
      })

      it('should return empty when missing COM delius ID', async () => {
        userAdminService.getRoUserByDeliusId = sinon.stub().resolves({ orgEmail: '' })
        const data = await service.getNotificationData({
          prisoner: {},
          notificationType: 'RO_NEW',
          submissionTarget: { deliusId: '' },
        })

        expect(data).to.eql([])
      })

      it('should return empty when missing COM', async () => {
        userAdminService.getRoUserByDeliusId = sinon.stub().resolves(null)
        const data = await service.getNotificationData({
          prisoner: {},
          notificationType: 'RO_NEW',
          submissionTarget: { deliusId: 'deliusId' },
        })

        expect(data).to.eql([])
      })

      it('should return empty when missing RO orgEmail', async () => {
        userAdminService.getRoUserByDeliusId = sinon.stub().resolves({ orgEmail: '', email: '' })
        const data = await service.getNotificationData({
          prisoner: {},
          notificationType: 'RO_NEW',
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
        })

        expect(data).to.eql([])
      })

      it('should throw if error in API calls', async () => {
        prisonerService.getEstablishmentForPrisoner.rejects(new Error('dead'))

        expect(
          service.getNotificationData({
            prisoner: {},
            notificationType: 'RO_NEW',
            submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          })
        ).to.be.rejected()
      })

      it('should generate RO notification data', async () => {
        const data = await service.getNotificationData({
          prisoner,
          token: 'token',
          notificationType: 'RO_NEW',
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          bookingId: '123',
          sendingUserName: 'sender',
        })

        expect(prisonerService.getEstablishmentForPrisoner).to.be.calledOnce()
        expect(prisonerService.getEstablishmentForPrisoner).to.be.calledWith('123', 'token')
        expect(userAdminService.getRoUserByDeliusId).to.be.calledOnce()
        expect(userAdminService.getRoUserByDeliusId).to.be.calledWith('deliusId')

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

      it('should generate RO notification data when no email', async () => {
        userAdminService.getRoUserByDeliusId = sinon.stub().resolves({
          orgEmail: 'admin@ro.email',
          email: '',
          organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
        })

        const data = await service.getNotificationData({
          prisoner,
          token: 'token',
          notificationType: 'RO_NEW',
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          bookingId: '123',
          sendingUserName: 'sender',
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
        userAdminService.getRoUserByDeliusId = sinon.stub().resolves({
          orgEmail: '',
          email: 'ro@ro.email',
          organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
        })

        const data = await service.getNotificationData({
          prisoner,
          token: 'token',
          notificationType: 'RO_NEW',
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          bookingId: '123',
          sendingUserName: 'sender',
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
        service = createNotificationService(
          prisonerService,
          userAdminService,
          deadlineService,
          configClient,
          notifyClient,
          audit,
          sinon.stub().returns(nomisClient),
          config
        )

        userAdminService.getRoUserByDeliusId = sinon.stub().resolves({
          orgEmail: '',
          email: 'ro@ro.email',
          organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
        })

        const data = await service.getNotificationData({
          prisoner,
          token: 'token',
          notificationType: 'RO_NEW',
          submissionTarget: { deliusId: 'deliusId', name: 'RO Name' },
          bookingId: '123',
          sendingUserName: 'sender',
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

    describe('CA notification data', () => {
      it('should return empty when missing CA email addresses for agency', async () => {
        configClient.getMailboxes = sinon.stub().resolves()
        const data = await service.getNotificationData({
          prisoner: {},
          notificationType: 'CA_RETURN',
          submissionTarget: { agencyId: 'MISSING' },
        })

        expect(data).to.eql([])
      })

      it('should return empty when empty CA email addresses for agency', async () => {
        configClient.getMailboxes = sinon.stub().resolves([])
        const data = await service.getNotificationData({
          prisoner: {},
          notificationType: 'CA_RETURN',
          submissionTarget: { agencyId: 'MISSING' },
        })

        expect(data).to.eql([])
      })

      it('should generate CA notification data', async () => {
        const data = await service.getNotificationData({
          prisoner,
          token: 'token',
          notificationType: 'CA_RETURN',
          submissionTarget: { agencyId: 'LT1' },
          bookingId: '123',
          sendingUserName: 'sender',
        })

        expect(data).to.eql([
          {
            email: 'test1@email.address',
            templateName: 'CA_RETURN',
            personalisation: {
              ...expectedCommonData,
              sender_name: 'sender',
              ca_name: 'Name One',
              prison: 'Moorland (HMP & YOI)',
            },
          },
          {
            email: 'test2@email.address',
            templateName: 'CA_RETURN',
            personalisation: {
              ...expectedCommonData,
              sender_name: 'sender',
              ca_name: 'Name Two',
              prison: 'Moorland (HMP & YOI)',
            },
          },
          {
            email: config.notifications.clearingOfficeEmail,
            templateName: 'CA_RETURN_COPY',
            personalisation: {
              ...expectedCommonData,
              sender_name: 'sender',
              ca_name: 'Name One',
              prison: 'Moorland (HMP & YOI)',
            },
          },
        ])
      })
    })

    describe('DM_TO_CA notification data', () => {
      it('should generate DM_TO_CA notification data', async () => {
        const data = await service.getNotificationData({
          prisoner,
          token: 'token',
          notificationType: 'DM_TO_CA_RETURN',
          submissionTarget: { agencyId: 'LT1' },
          bookingId: '123',
          sendingUserName: 'sender',
        })

        expect(data).to.eql([
          {
            email: 'test1@email.address',
            templateName: 'CA_RETURN',
            personalisation: {
              ...expectedCommonData,
              sender_name: 'sender',
              ca_name: 'Name One',
              prison: 'Moorland (HMP & YOI)',
            },
          },
          {
            email: 'test2@email.address',
            templateName: 'CA_RETURN',
            personalisation: {
              ...expectedCommonData,
              sender_name: 'sender',
              ca_name: 'Name Two',
              prison: 'Moorland (HMP & YOI)',
            },
          },
        ])
      })
    })

    describe('DM notification data', () => {
      it('should return empty when missing DM email addresses for agency', async () => {
        configClient.getMailboxes = sinon.stub().resolves([])
        const data = await service.getNotificationData({
          prisoner: {},
          notificationType: 'DM_NEW',
        })

        expect(data).to.eql([])
      })

      it('should generate DM notification data', async () => {
        const data = await service.getNotificationData({
          prisoner,
          token: 'token',
          notificationType: 'DM_NEW',
          submissionTarget: { agencyId: 'LT1' },
          bookingId: '123',
          sendingUserName: 'sender',
        })

        expect(data).to.eql([
          {
            email: 'test1@email.address',
            templateName: 'DM_NEW',
            personalisation: {
              ...expectedCommonData,
              dm_name: 'Name One',
            },
          },
          {
            email: 'test2@email.address',
            templateName: 'DM_NEW',
            personalisation: {
              ...expectedCommonData,
              dm_name: 'Name Two',
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
        notificationType: 'CA_RETURN',
        submissionTarget: {},
        bookingId: {},
        sendingUserName: {},
        token: {},
      }

      const result = await service.sendNotifications(inputs)
      expect(result).to.eql([])
    })
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
      const expectedCommonData = {
        offender_dob: '1/1/1',
        offender_name: 'First Last',
        offender_noms: 'AB1234A',
        domain: 'http://localhost:3000',
      }

      const firstNotification = {
        ...expectedCommonData,
        booking_id: 2,
        date: 'Tuesday 15th January',
        prison: 'HMP Blah',
        ro_name: undefined,
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
      }
      const secondNotification = {
        ...expectedCommonData,
        booking_id: 3,
        date: 'Tuesday 15th January',
        prison: 'HMP Blah',
        ro_name: undefined,
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
      }
      const overdueTemplate = templates.RO_OVERDUE.templateId
      const expectedEmail = 'ro@ro.email'

      await service.notifyRoReminders('token')

      expect(notifyClient.sendEmail).to.have.callCount(10)
      expect(notifyClient.sendEmail).to.be.calledWith(overdueTemplate, expectedEmail, {
        personalisation: firstNotification,
      })
      expect(notifyClient.sendEmail).to.be.calledWith(overdueTemplate, expectedEmail, {
        personalisation: secondNotification,
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
