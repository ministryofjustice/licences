const createDeadlineService = require('../../server/services/deadlineService')

describe('deadlineService', () => {
  let licenceClient
  let service
  let realDateNow

  const transitionDate = '2019-01-01 12:00:00'

  beforeEach(() => {
    licenceClient = {
      getLicencesInStageBeforeDate: jest.fn().mockResolvedValue([
        { booking_id: 1, transition_date: transitionDate },
        { booking_id: 2, transition_date: transitionDate },
      ]),
      getLicencesInStageBetweenDates: jest.fn().mockResolvedValue([
        { booking_id: 3, transition_date: transitionDate },
        { booking_id: 4, transition_date: transitionDate },
      ]),
    }
    service = createDeadlineService(licenceClient)
    const time = new Date('April 25, 2019 01:00:00')
    realDateNow = Date.now.bind(global.Date)
    Date.now = jest.fn(() => time)
  })

  afterEach(() => {
    global.Date.now = realDateNow
  })

  describe('getOverdue', () => {
    test('should reject unknown role code', () => {
      return expect(service.getOverdue('none')).rejects.not.toBeNull()
    })

    test('should request matching licences from client', () => {
      service.getOverdue('RO')
      expect(licenceClient.getLicencesInStageBeforeDate).toHaveBeenCalled()
      expect(licenceClient.getLicencesInStageBeforeDate).toHaveBeenCalledWith('PROCESSING_RO', '2019-04-08 14:59:59')
    })

    test('should return booking IDs and transition dates', () => {
      return expect(service.getOverdue('RO')).resolves.toEqual([
        { booking_id: 1, transition_date: transitionDate },
        { booking_id: 2, transition_date: transitionDate },
      ])
    })

    test('should throw if error getting licence', () => {
      licenceClient.getLicencesInStageBeforeDate.mockRejectedValue()
      return expect(service.getOverdue('RO')).rejects.not.toBeNull()
    })
  })

  describe('getDueInDays', () => {
    test('should reject if days not a number', () => {
      return expect(service.getDueInDays('RO', '')).rejects.not.toBeNull()
    })

    test('should reject if days not a whole number', () => {
      return expect(service.getDueInDays('RO', 2.5)).rejects.not.toBeNull()
    })

    test('should reject if days not a positive number', () => {
      return expect(service.getDueInDays('RO', -2)).rejects.not.toBeNull()
    })

    test('should reject unknown role code', () => {
      return expect(service.getDueInDays('none', 2)).rejects.not.toBeNull()
    })

    test('should request matching licences from client', () => {
      service.getDueInDays('RO', 2)
      expect(licenceClient.getLicencesInStageBetweenDates).toHaveBeenCalled()
      expect(licenceClient.getLicencesInStageBetweenDates).toHaveBeenCalledWith(
        'PROCESSING_RO',
        '2019-04-10 15:00:00',
        '2019-04-11 14:59:59'
      )
    })

    test('should return booking IDs and transition dates', () => {
      return expect(service.getDueInDays('RO', 2)).resolves.toEqual([
        { booking_id: 3, transition_date: transitionDate },
        { booking_id: 4, transition_date: transitionDate },
      ])
    })

    test('should allow 0 days as input', () => {
      service.getDueInDays('RO', 0)
      expect(licenceClient.getLicencesInStageBetweenDates).toHaveBeenCalled()
      expect(licenceClient.getLicencesInStageBetweenDates).toHaveBeenCalledWith(
        'PROCESSING_RO',
        '2019-04-08 15:00:00',
        '2019-04-09 14:59:59'
      )
    })

    test('should throw if error getting licence', () => {
      licenceClient.getLicencesInStageBetweenDates.mockRejectedValue()
      return expect(service.getDueInDays('RO', 2)).rejects.not.toBeNull()
    })
  })
})
