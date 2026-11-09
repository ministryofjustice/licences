import { HdcService } from '../../../server/services/hdc/hdcService'
import { HdcClient } from '../../../server/data/hdcApiClient'
import { HdcCvlEventRequest } from '../../../server/@types/hdcApiImport'

const logger = require('../../../log')

jest.mock('../../../log')

describe('HdcService', () => {
  let hdcClient: jest.Mocked<HdcClient>
  let licenceService: any
  let conditionsServiceFactory: any
  let service: HdcService

  beforeEach(() => {
    hdcClient = {
      getBespokeConditions: jest.fn(),
      migrateSingleLicenceToCvl: jest.fn(),
      migrateBatchToCvl: jest.fn(),
      setMigrationLogRetry: jest.fn(),
      migrateSingleLicenceToCvlPreview: jest.fn(),
      getMigrationLogs: jest.fn(),
      getFailedReport: jest.fn(),
      postCvlEvent: jest.fn(),
    } as unknown as jest.Mocked<HdcClient>

    licenceService = {}
    conditionsServiceFactory = {}

    service = new HdcService(hdcClient, licenceService, conditionsServiceFactory)
  })

  describe('postCvlEvent', () => {
    const event: HdcCvlEventRequest = {
      bookingId: 123,
      eventType: 'OPT_OUT',
      licenceId: 456,
      nomsNumber: 'A1234AA',
      triggeredBy: 'USER',
      reason: 'reason',
    }

    it('should call hdcClient.postCvlEvent and log info', async () => {
      hdcClient.postCvlEvent.mockResolvedValue(undefined)

      await service.postCvlEvent(event)

      expect(hdcClient.postCvlEvent).toHaveBeenCalledWith(event)
      expect(logger.info).toHaveBeenCalledWith('Posting CVL event for event: {"bookingId":123,"eventType":"OPT_OUT","licenceId":456,"nomsNumber":"A1234AA","triggeredBy":"USER","reason":"reason"}')
    })

    it('should log error and throw if hdcClient.postCvlEvent fails', async () => {
      const error = new Error('API error')
      hdcClient.postCvlEvent.mockRejectedValue(error)

      await expect(service.postCvlEvent(event)).rejects.toThrow('API error')

      expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({
        message: 'API error',
        stack: error.stack,
      }), 'Failed to post CVL event')
    })
  })

  it.each<HdcCvlEventRequest['eventType']>([
    'OPT_IN',
    'OPT_OUT',
    'POSTPONE',
    'RESUME',
    'REFUSE',
    'ADDRESS_WITHDRAWN',
    'RESIDENTIAL_ADDRESS_CHANGED_TO_APPROVED_PREMISES',
  ])('should publish %s with its metadata unchanged', async (eventType) => {
    const event: HdcCvlEventRequest = {
      eventType,
      bookingId: 123,
      licenceId: 456,
      nomsNumber: 'A1234AA',
      triggeredBy: 'USER',
      reason: 'reason',
    }

    await service.postCvlEvent(event)

    expect(hdcClient.postCvlEvent).toHaveBeenCalledTimes(1)
    expect(hdcClient.postCvlEvent).toHaveBeenCalledWith(event)
  })

  it('should accept an event without an optional reason', async () => {
    const event: HdcCvlEventRequest = {
      eventType: 'RESIDENTIAL_ADDRESS_CHANGED_TO_APPROVED_PREMISES',
      bookingId: 123,
      licenceId: 456,
      nomsNumber: 'A1234AA',
      triggeredBy: 'USER',
    }

    await service.postCvlEvent(event)

    expect(hdcClient.postCvlEvent).toHaveBeenCalledWith(event)
  })
})
