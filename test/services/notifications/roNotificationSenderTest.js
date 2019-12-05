const createSendRoNotifications = require('../../../server/services/notifications/roNotificationSender')

describe('sendRoNotifications', () => {
  let service
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

    notificationSender = {
      notify: sinon.stub().resolves({}),
    }

    service = createSendRoNotifications(notificationSender, config)
  })

  describe('getNotifications', () => {
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

      const personalisation = {
        ...expectedCommonData,
        prison: 'HMP Blah',
        ro_name: 'RO Name',
        date: 'Monday 25th March',
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
      }

      const responsibleOfficer = {
        deliusId: 'delius-1',
        name: 'name-1',
        nomsNumber: 'NOM-1',
        lduCode: 'LDU-1',
        lduDescription: 'LDU-DESC-1',
        probationAreaCode: 'PROB-1',
        probationAreaDescription: 'PROB-DESC1',
        email: 'ro@ro.email',
        organisation: 'Orgnisation 1',
        functionalMailbox: 'admin@ro.email',
      }

      it('should generate RO notification data for RO_TWO_DAYS', async () => {
        const data = service.getNotifications(
          responsibleOfficer,
          personalisation,
          service.notificationTypes.RO_TWO_DAYS
        )

        expect(data).to.eql([
          {
            email: 'ro@ro.email',
            templateName: 'RO_TWO_DAYS',
            personalisation,
          },
          {
            email: 'admin@ro.email',
            templateName: 'RO_TWO_DAYS_COPY',
            personalisation,
          },
        ])
      })

      it('should generate RO notification data for RO_DUE', () => {
        const data = service.getNotifications(responsibleOfficer, personalisation, service.notificationTypes.RO_DUE)

        expect(data).to.eql([
          {
            email: 'ro@ro.email',
            templateName: 'RO_DUE',
            personalisation,
          },
          {
            email: 'admin@ro.email',
            templateName: 'RO_DUE_COPY',
            personalisation,
          },
        ])
      })

      it('should generate RO notification data when RO_OVERDUE', async () => {
        const data = service.getNotifications(responsibleOfficer, personalisation, service.notificationTypes.RO_OVERDUE)

        expect(data).to.eql([
          {
            email: 'ro@ro.email',
            templateName: 'RO_OVERDUE',
            personalisation,
          },
          {
            email: 'admin@ro.email',
            templateName: 'RO_OVERDUE_COPY',
            personalisation,
          },
          {
            email: config.notifications.clearingOfficeEmail,
            templateName: 'RO_OVERDUE_COPY',
            personalisation,
          },
        ])
      })

      it('should generate RO notification data when no email', async () => {
        const data = service.getNotifications(
          { ...responsibleOfficer, email: null },
          personalisation,
          service.notificationTypes.RO_NEW
        )

        expect(data).to.eql([
          {
            email: 'admin@ro.email',
            templateName: 'RO_NEW_COPY',
            personalisation,
          },
          {
            email: config.notifications.clearingOfficeEmail,
            templateName: 'RO_NEW_COPY',
            personalisation,
          },
        ])
      })

      it('should generate RO notification data when no orgEmail', async () => {
        const data = service.getNotifications(
          { ...responsibleOfficer, functionalMailbox: null },
          personalisation,
          service.notificationTypes.RO_NEW
        )

        expect(data).to.eql([
          {
            email: 'ro@ro.email',
            templateName: 'RO_NEW',
            personalisation,
          },
          {
            email: config.notifications.clearingOfficeEmail,
            templateName: 'RO_NEW_COPY',
            personalisation,
          },
        ])
      })

      it('should no generate RO clearing office notification data if the co email is disabled', async () => {
        config.notifications.clearingOfficeEmailEnabled = 'No'
        service = createSendRoNotifications(notificationSender, config)

        const data = service.getNotifications(
          { ...responsibleOfficer, functionalMailbox: null },
          personalisation,
          service.notificationTypes.RO_NEW
        )

        expect(data).to.eql([
          {
            email: 'ro@ro.email',
            templateName: 'RO_NEW',
            personalisation,
          },
        ])
      })
    })
  })
})
