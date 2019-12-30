const createReportingService = require('../../server/services/reportingService')

describe('reportingServiceTest', () => {
  let service
  const audit = {
    getEvents: jest.fn(),
  }

  beforeEach(() => {
    audit.getEvents.mockResolvedValue({ key: 'value' })
    service = createReportingService(audit)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getCurfewAddressSubmission', () => {
    test('should call getEvents from the audit client ', async () => {
      await service.getAddressSubmission()

      expect(audit.getEvents).toHaveBeenCalled()
      expect(audit.getEvents).toHaveBeenCalledWith('SEND', { transitionType: 'caToRo' }, undefined, undefined)
    })

    test('should pass in dates if they are supplied', async () => {
      await service.getAddressSubmission('start', 'end')

      expect(audit.getEvents).toHaveBeenCalled()
      expect(audit.getEvents).toHaveBeenCalledWith('SEND', { transitionType: 'caToRo' }, 'start', 'end')
    })
  })

  describe('getAssessmentComplete', () => {
    test('should call getEvents from the audit client', async () => {
      await service.getAssessmentComplete()

      expect(audit.getEvents).toHaveBeenCalled()
      expect(audit.getEvents).toHaveBeenCalledWith('SEND', { transitionType: 'roToCa' }, undefined, undefined)
    })
  })

  describe('getFinalChecksComplete', () => {
    test('should call getEvents from the audit client', async () => {
      await service.getFinalChecksComplete('123')

      expect(audit.getEvents).toHaveBeenCalled()
      expect(audit.getEvents).toHaveBeenCalledWith('SEND', { transitionType: 'caToDm' }, '123', undefined)
    })
  })

  describe('getApprovalComplete', () => {
    test('should call getEvents from the audit client', async () => {
      await service.getApprovalComplete('123')

      expect(audit.getEvents).toHaveBeenCalled()
      expect(audit.getEvents).toHaveBeenCalledWith('SEND', { transitionType: 'dmToCa' }, '123', undefined)
    })
  })
})
