const createDeadlineService = require('../../server/services/deadlineService')

describe('deadlineService', () => {
  let licenceClient
  let service
  let clock

  const transitionDate = '2019-01-01 12:00:00'

  beforeEach(() => {
    licenceClient = {
      getLicencesInStageBeforeDate: sinon
        .stub()
        .resolves([
          { booking_id: 1, transition_date: transitionDate },
          { booking_id: 2, transition_date: transitionDate },
        ]),
      getLicencesInStageBetweenDates: sinon
        .stub()
        .resolves([
          { booking_id: 3, transition_date: transitionDate },
          { booking_id: 4, transition_date: transitionDate },
        ]),
    }
    service = createDeadlineService(licenceClient)
    clock = sinon.useFakeTimers(new Date('April 25, 2019 01:00:00').getTime())
  })

  afterEach(() => {
    clock.restore()
  })

  describe('getOverdue', () => {
    it('should reject unknown role code', () => {
      return expect(service.getOverdue('none')).to.eventually.be.rejected()
    })

    it('should request matching licences from client', () => {
      service.getOverdue('RO')
      expect(licenceClient.getLicencesInStageBeforeDate).to.be.calledOnce()
      expect(licenceClient.getLicencesInStageBeforeDate).to.be.calledWith('PROCESSING_RO', '2019-04-08 14:59:59')
    })

    it('should return booking IDs and transition dates', () => {
      return expect(service.getOverdue('RO')).to.eventually.eql([
        { booking_id: 1, transition_date: transitionDate },
        { booking_id: 2, transition_date: transitionDate },
      ])
    })

    it('should throw if error getting licence', () => {
      licenceClient.getLicencesInStageBeforeDate.rejects()
      return expect(service.getOverdue('RO')).to.eventually.be.rejected()
    })
  })

  describe('getDueInDays', () => {
    it('should reject if days not a number', () => {
      return expect(service.getDueInDays('RO', '')).to.eventually.be.rejected()
    })

    it('should reject if days not a whole number', () => {
      return expect(service.getDueInDays('RO', 2.5)).to.eventually.be.rejected()
    })

    it('should reject if days not a positive number', () => {
      return expect(service.getDueInDays('RO', -2)).to.eventually.be.rejected()
    })

    it('should reject unknown role code', () => {
      return expect(service.getDueInDays('none', 2)).to.eventually.be.rejected()
    })

    it('should request matching licences from client', () => {
      service.getDueInDays('RO', 2)
      expect(licenceClient.getLicencesInStageBetweenDates).to.be.calledOnce()
      expect(licenceClient.getLicencesInStageBetweenDates).to.be.calledWith(
        'PROCESSING_RO',
        '2019-04-10 15:00:00',
        '2019-04-11 14:59:59'
      )
    })

    it('should return booking IDs and transition dates', () => {
      return expect(service.getDueInDays('RO', 2)).to.eventually.eql([
        { booking_id: 3, transition_date: transitionDate },
        { booking_id: 4, transition_date: transitionDate },
      ])
    })

    it('should allow 0 days as input', () => {
      service.getDueInDays('RO', 0)
      expect(licenceClient.getLicencesInStageBetweenDates).to.be.calledOnce()
      expect(licenceClient.getLicencesInStageBetweenDates).to.be.calledWith(
        'PROCESSING_RO',
        '2019-04-08 15:00:00',
        '2019-04-09 14:59:59'
      )
    })

    it('should throw if error getting licence', () => {
      licenceClient.getLicencesInStageBetweenDates.rejects()
      return expect(service.getDueInDays('RO', 2)).to.eventually.be.rejected()
    })
  })
})
