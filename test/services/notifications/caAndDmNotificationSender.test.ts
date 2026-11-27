import CaAndDmNotificationSender from '../../../server/services/notifications/caAndDmNotificationSender'
import NotificationSender from '../../../server/services/notifications/notificationSender'
import { RoContactDetailsService } from '../../../server/services/roContactDetailsService'
import { ConfigClient, Mailbox } from '../../../server/data/configClient'

jest.mock('../../../server/services/notifications/notificationSender')
jest.mock('../../../server/services/roContactDetailsService')
jest.mock('../../../server/data/configClient')

const { createPrisonerServiceStub } = require('../../mockServices')

describe('sendCaAndDmNotifications', () => {
  let service: CaAndDmNotificationSender
  let prisonerService
  let roContactDetailsService: jest.Mocked<RoContactDetailsService>
  let configClient: jest.Mocked<ConfigClient>
  let notificationSender: jest.Mocked<NotificationSender>
  let nomisClient

  // Several tests deliberately pass partial arguments
  const getData = (args: object) => service.getNotificationData(args as Parameters<typeof service.getNotificationData>[0])

  beforeEach(() => {
    prisonerService = createPrisonerServiceStub()
    prisonerService.getEstablishmentForPrisoner.mockReturnValue({ premise: 'HMP Test', agencyId: 'LT1' })
    roContactDetailsService = new RoContactDetailsService(
      undefined,
      undefined,
      undefined
    ) as jest.Mocked<RoContactDetailsService>
    roContactDetailsService.getFunctionalMailBox.mockResolvedValue('admin@ro.email')
    configClient = new ConfigClient() as jest.Mocked<ConfigClient>
    configClient.getMailboxes.mockResolvedValue([
      { email: 'test1@email.address', name: 'Name One' },
      { email: 'test2@email.address', name: 'Name Two' },
    ] as Mailbox[])
    notificationSender = new NotificationSender(undefined, undefined, undefined) as jest.Mocked<NotificationSender>
    notificationSender.notify.mockResolvedValue()

    nomisClient = {
      getEstablishment: jest.fn().mockReturnValue({
        description: 'Moorland (HMP & YOI)',
        agencyId: 'MDI',
        agencyType: 'INST',
        addressType: 'BUS',
        premise: 'Moorland (HMP & YOI)',
        locality: 'Test Locality',
        city: 'Test City',
        country: 'England',
        postCode: 'TEST',
        phones: [
          {
            number: '484 555 6431',
            type: 'BUS',
          },
        ],
      }),
    }
    const nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)

    service = new CaAndDmNotificationSender(
      prisonerService,
      roContactDetailsService,
      configClient,
      notificationSender,
      nomisClientBuilder,
      ['CA_RETURN', 'CA_DECISION', 'RO_NEW', 'RO_TWO_DAYS', 'RO_DUE', 'RO_OVERDUE', 'DM_NEW', 'DM_TO_CA_RETURN'],
      'http://localhost:3000'
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

    test('should return empty when unknown notification type', async () => {
      const data = await getData({
        prisoner: {},
        notificationType: 'UNKNOWN',
      })

      expect(data).toEqual([])
    })

    describe('CA notification data', () => {
      test('should return empty when missing CA email addresses for agency', async () => {
        configClient.getMailboxes.mockResolvedValue(undefined)
        const data = await getData({
          prisoner: {},
          notificationType: 'CA_RETURN',
          submissionTarget: { agencyId: 'MISSING' },
        })

        expect(data).toEqual([])
      })

      test('should return empty when empty CA email addresses for agency', async () => {
        configClient.getMailboxes.mockResolvedValue([])
        const data = await getData({
          prisoner: {},
          notificationType: 'CA_RETURN',
          submissionTarget: { agencyId: 'MISSING' },
        })

        expect(data).toEqual([])
      })

      test('should generate CA notification data', async () => {
        const data = await getData({
          prisoner,
          token: 'token',
          notificationType: 'CA_RETURN',
          submissionTarget: { agencyId: 'LT1' },
          bookingId: '123',
          sendingUserName: 'sender',
        })

        expect(data).toEqual([
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
      test('should generate DM_TO_CA notification data', async () => {
        const data = await getData({
          prisoner,
          token: 'token',
          notificationType: 'DM_TO_CA_RETURN',
          submissionTarget: { agencyId: 'LT1' },
          bookingId: '123',
          sendingUserName: 'sender',
        })

        expect(data).toEqual([
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
      test('should return empty when missing DM email addresses for agency', async () => {
        configClient.getMailboxes.mockResolvedValue([])
        const data = await getData({
          prisoner: {},
          notificationType: 'DM_NEW',
        })

        expect(data).toEqual([])
      })

      test('should generate DM notification data', async () => {
        const data = await getData({
          prisoner,
          token: 'token',
          notificationType: 'DM_NEW',
          submissionTarget: { agencyId: 'LT1' },
          bookingId: '123',
          sendingUserName: 'sender',
        })

        expect(data).toEqual([
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
    test('Should not error if internal errors, just return empty', async () => {
      prisonerService.getEstablishmentForPrisoner.mockRejectedValue(new Error('dead'))
      const inputs = {
        prisoner: {},
        notificationType: 'CA_RETURN',
        submissionTarget: {},
        bookingId: 123,
        sendingUserName: 'user',
        token: 'token',
      }

      const result = await service.sendNotifications(inputs)
      expect(result).toEqual([])
    })
  })
})
