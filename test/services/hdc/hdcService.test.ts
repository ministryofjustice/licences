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
      expect(logger.info).toHaveBeenCalledWith('Posting CVL event for booking ID: 123, event type: OPT_OUT event.reason: reason')
    })

    it('should log error and throw if hdcClient.postCvlEvent fails', async () => {
      const error = new Error('API error')
      hdcClient.postCvlEvent.mockRejectedValue(error)

      await expect(service.postCvlEvent(event)).rejects.toThrow('API error')

      expect(logger.error).toHaveBeenCalledWith('Failed to post CVL event', expect.objectContaining({
        message: 'API error',
      }))
    })
  })

  describe('postOptOutEvent', () => {
    it('should call postCvlEvent with OPT_OUT event type', async () => {
      hdcClient.postCvlEvent.mockResolvedValue(undefined)

      await service.postOptOutEvent(123, 456, 'A1234AA', 'USER', 'USER opted out of HDC at curfew address task')

      expect(hdcClient.postCvlEvent).toHaveBeenCalledWith({
        bookingId: 123,
        licenceId: 456,
        nomsNumber: 'A1234AA',
        eventType: 'OPT_OUT',
        reason: 'USER opted out of HDC at curfew address task',
        triggeredBy: 'USER',
      })
    })
  })
})
