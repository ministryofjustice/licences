const createSendCaAndDmNotifications = require('../../../server/services/notifications/caAndDmNotificationSender')

describe('sendCaAndDmNotifications', () => {
  let service
  let prisonerService
  let roContactDetailsService
  let configClient
  let notificationSender
  let nomisClient
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
    configClient = {
      getMailboxes: sinon
        .stub()
        .resolves([
          { email: 'test1@email.address', name: 'Name One' },
          { email: 'test2@email.address', name: 'Name Two' },
        ]),
    }
    notificationSender = {
      notify: sinon.stub().resolves({}),
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

    service = createSendCaAndDmNotifications(
      prisonerService,
      roContactDetailsService,
      configClient,
      notificationSender,
      nomisClientBuilder,
      config
    )
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
          {
            email: 'admin@ro.email',
            personalisation: {
              ...expectedCommonData,
              booking_id: '123',
              sender_name: 'sender',
              ca_name: 'Name One',
              prison: 'Moorland (HMP & YOI)',
            },
            templateName: 'CA_RETURN_COPY',
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
})
