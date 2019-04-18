const nock = require('nock')

const config = require('../../server/config')
const nomisClientBuilder = require('../../server/data/nomisClientBuilder')

describe('nomisClient', () => {
  let fakeNomis
  let fakeAuth
  let nomisClient

  beforeEach(() => {
    fakeNomis = nock(`${config.nomis.apiUrl}`)
    fakeAuth = nock(`${config.nomis.authUrl}`)
    nomisClient = nomisClientBuilder('token')
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getBooking', () => {
    it('should return data from api', () => {
      fakeNomis.get(`/bookings/1`).reply(200, { key: 'value' })

      return expect(nomisClient.getBooking('1')).to.eventually.eql({ key: 'value' })
    })

    it('should reject if api fails', () => {
      fakeNomis.get(`/bookings/1`).reply(500)

      return expect(nomisClient.getBooking('1')).to.be.rejected()
    })
  })

  describe('getImageInfo', () => {
    it('should return data from api', () => {
      fakeNomis.get(`/images/1`).reply(200, { key: 'value' })

      return expect(nomisClient.getImageInfo('1')).to.eventually.eql({ key: 'value' })
    })

    it('should reject if api fails', () => {
      fakeNomis.get(`/images/1`).reply(500)

      return expect(nomisClient.getImageInfo('1')).to.be.rejected()
    })
  })

  describe('getImageData', () => {
    it('should return a buffer', () => {
      fakeNomis.get(`/images/1/data`).reply(200, 'image')

      return expect(nomisClient.getImageData('1')).to.eventually.eql(Buffer.from('image'))
    })

    it('should throw if not found', () => {
      fakeNomis.get(`/images/1`).reply(404)

      return expect(nomisClient.getImageData('1')).to.be.rejected()
    })

    it('should throw if api fails', () => {
      fakeNomis.get(`/images/1`).reply(500)

      return expect(nomisClient.getImageData('1')).to.be.rejected()
    })
  })

  describe('getHdcEligiblePrisoners', () => {
    const url = '/offender-sentences/home-detention-curfew-candidates'

    it('should return data from api', () => {
      fakeNomis.get(url).reply(200, [
        {
          sentenceDetail: {
            conditionalReleaseDate: 'a',
          },
        },
      ])

      return expect(nomisClient.getHdcEligiblePrisoners()).to.eventually.eql([
        {
          sentenceDetail: {
            conditionalReleaseDate: 'a',
            releaseDate: 'a',
            effectiveAutomaticReleaseDate: null,
            effectiveConditionalReleaseDate: 'a',
          },
        },
      ])
    })

    it('should reject if api fails', () => {
      fakeNomis.get(url).reply(500)

      return expect(nomisClient.getHdcEligiblePrisoners()).to.be.rejected()
    })

    it('should set releaseDate as CRDOverride if present', () => {
      fakeNomis.get(url).reply(200, [
        {
          sentenceDetail: {
            conditionalReleaseOverrideDate: 'a',
            conditionalReleaseDate: 'b',
          },
        },
        {
          sentenceDetail: {
            conditionalReleaseOverrideDate: 'c',
            conditionalReleaseDate: 'd',
            automaticReleaseDate: 'y',
          },
        },
      ])

      return expect(nomisClient.getHdcEligiblePrisoners()).to.eventually.eql([
        {
          sentenceDetail: {
            conditionalReleaseOverrideDate: 'a',
            conditionalReleaseDate: 'b',
            releaseDate: 'a',
            effectiveAutomaticReleaseDate: null,
            effectiveConditionalReleaseDate: 'a',
          },
        },
        {
          sentenceDetail: {
            conditionalReleaseOverrideDate: 'c',
            conditionalReleaseDate: 'd',
            automaticReleaseDate: 'y',
            releaseDate: 'c',
            effectiveAutomaticReleaseDate: 'y',
            effectiveConditionalReleaseDate: 'c',
          },
        },
      ])
    })

    it('should set releaseDate as CRD if no CRDOverride is present', () => {
      fakeNomis.get(url).reply(200, [
        {
          sentenceDetail: {
            conditionalReleaseDate: 'a',
            automaticReleaseDate: 'b',
          },
        },
        {
          sentenceDetail: {
            conditionalReleaseDate: 'c',
            automaticReleaseDate: 'd',
          },
        },
      ])

      return expect(nomisClient.getHdcEligiblePrisoners()).to.eventually.eql([
        {
          sentenceDetail: {
            conditionalReleaseDate: 'a',
            automaticReleaseDate: 'b',
            releaseDate: 'a',
            effectiveAutomaticReleaseDate: 'b',
            effectiveConditionalReleaseDate: 'a',
          },
        },
        {
          sentenceDetail: {
            conditionalReleaseDate: 'c',
            automaticReleaseDate: 'd',
            releaseDate: 'c',
            effectiveAutomaticReleaseDate: 'd',
            effectiveConditionalReleaseDate: 'c',
          },
        },
      ])
    })

    it('should set releaseDate as ARDOverride if no CRD is present', () => {
      fakeNomis.get(url).reply(200, [
        {
          sentenceDetail: {
            automaticReleaseOverrideDate: 'b',
          },
        },
        {
          sentenceDetail: {
            automaticReleaseOverrideDate: 'd',
          },
        },
      ])

      return expect(nomisClient.getHdcEligiblePrisoners()).to.eventually.eql([
        {
          sentenceDetail: {
            automaticReleaseOverrideDate: 'b',
            releaseDate: 'b',
            effectiveAutomaticReleaseDate: 'b',
            effectiveConditionalReleaseDate: null,
          },
        },
        {
          sentenceDetail: {
            automaticReleaseOverrideDate: 'd',
            releaseDate: 'd',
            effectiveAutomaticReleaseDate: 'd',
            effectiveConditionalReleaseDate: null,
          },
        },
      ])
    })

    it('should set releaseDate as ARD if no CRD or ARDOverride is present', () => {
      fakeNomis.get(url).reply(200, [
        {
          sentenceDetail: {
            automaticReleaseDate: 'b',
          },
        },
        {
          sentenceDetail: {
            automaticReleaseDate: 'd',
          },
        },
      ])

      return expect(nomisClient.getHdcEligiblePrisoners()).to.eventually.eql([
        {
          sentenceDetail: {
            automaticReleaseDate: 'b',
            releaseDate: 'b',
            effectiveAutomaticReleaseDate: 'b',
            effectiveConditionalReleaseDate: null,
          },
        },
        {
          sentenceDetail: {
            automaticReleaseDate: 'd',
            releaseDate: 'd',
            effectiveAutomaticReleaseDate: 'd',
            effectiveConditionalReleaseDate: null,
          },
        },
      ])
    })
  })

  describe('getAliases', () => {
    it('should return data from api', () => {
      fakeNomis.get(`/bookings/1/aliases`).reply(200, { key: 'value' })

      return expect(nomisClient.getAliases('1')).to.eventually.eql({ key: 'value' })
    })

    it('should reject if api fails', () => {
      fakeNomis.get(`/bookings/1/aliases`).reply(500)

      return expect(nomisClient.getAliases('1')).to.be.rejected()
    })
  })

  describe('getIdentifiers', () => {
    it('should return data from api', () => {
      fakeNomis.get(`/bookings/1/identifiers`).reply(200, [{ key: '1' }, { key: '2' }])

      return expect(nomisClient.getIdentifiers('1')).to.eventually.eql([{ key: '1' }, { key: '2' }])
    })

    it('should reject if api fails', () => {
      fakeNomis.get(`/bookings/1/identifiers`).reply(500)

      return expect(nomisClient.getIdentifiers('1')).to.be.rejected()
    })
  })

  describe('getMainOffence', () => {
    it('should return data from api', () => {
      fakeNomis.get(`/bookings/1/mainOffence`).reply(200, { key: 'value' })

      return expect(nomisClient.getMainOffence('1')).to.eventually.eql({ key: 'value' })
    })

    it('should reject if api fails', () => {
      fakeNomis.get(`/bookings/1/mainOffence`).reply(500)

      return expect(nomisClient.getMainOffence('1')).to.be.rejected()
    })
  })

  describe('getRoRelations', () => {
    it('should return data from api', () => {
      fakeNomis.get(`/bookings/1/relationships?relationshipType=RO`).reply(200, { key: 'value' })

      return expect(nomisClient.getRoRelations('1')).to.eventually.eql({ key: 'value' })
    })

    it('should reject if api fails', () => {
      fakeNomis.get(`/bookings/1/relationships?query=relationshipType%3Aeq%3A%27RO%27`).reply(500)

      return expect(nomisClient.getRoRelations('1')).to.be.rejected()
    })
  })

  describe('getROPrisoners', () => {
    const url = '/offender-relationships/externalRef/1/RO'

    it('should return data from api', () => {
      fakeNomis.get(url).reply(200, { key: 'value' })

      return expect(nomisClient.getROPrisoners('1')).to.eventually.eql({ key: 'value' })
    })

    it('should reject if api fails', () => {
      fakeNomis.get(url).reply(500)

      return expect(nomisClient.getROPrisoners('1')).to.be.rejected()
    })
  })

  describe('getEstablishment', () => {
    it('should return data from api', () => {
      fakeNomis.get(`/agencies/prison/1`).reply(200, { key: 'value' })

      return expect(nomisClient.getEstablishment('1')).to.eventually.eql({ key: 'value' })
    })

    it('should reject if api fails', () => {
      fakeNomis.get(`/agencies/prison/1`).reply(500)

      return expect(nomisClient.getEstablishment('1')).to.be.rejected()
    })
  })

  describe('token refreshing', () => {
    let clock

    beforeEach(() => {
      clock = sinon.useFakeTimers(new Date('May 31, 2018 12:00:00').getTime())
    })

    afterEach(() => {
      clock.restore()
    })

    it('should not try to refresh if not an unauthorised response', () => {
      fakeNomis
        .get(`/agencies/prison/1`)
        .reply(500)
        .get(`/agencies/prison/1`)
        .reply(200, { response: 'this' })

      return expect(nomisClient.getEstablishment('1')).to.be.rejected()
    })

    it('should not try to refresh twice in a row', () => {
      fakeNomis
        .get(`/agencies/prison/1`)
        .reply(401)
        .get(`/agencies/prison/1`)
        .reply(401, { response: 'this' })

      return expect(nomisClient.getEstablishment('1')).to.be.rejected()
    })
  })

  describe('getOffenderSentencesByBookingId', () => {
    it('should return data from api', () => {
      fakeNomis
        .post(`/offender-sentences/bookings`, ['1'])
        .reply(200, [{ sentenceDetail: { conditionalReleaseDate: 'a' } }])

      return expect(nomisClient.getOffenderSentencesByBookingId(['1'])).to.eventually.eql([
        {
          sentenceDetail: {
            conditionalReleaseDate: 'a',
            releaseDate: 'a',
            effectiveAutomaticReleaseDate: null,
            effectiveConditionalReleaseDate: 'a',
          },
        },
      ])
    })

    it('should return data from api without release dates if disabled', () => {
      fakeNomis
        .post(`/offender-sentences/bookings`, ['1'])
        .reply(200, [{ sentenceDetail: { conditionalReleaseDate: 'a' } }])

      return expect(nomisClient.getOffenderSentencesByBookingId(['1'], false)).to.eventually.eql([
        {
          sentenceDetail: {
            conditionalReleaseDate: 'a',
          },
        },
      ])
    })

    it('should reject if api fails', () => {
      fakeNomis.post(`/offender-sentences`, ['1']).reply(500)

      return expect(nomisClient.getOffenderSentencesByBookingId(['1'])).to.be.rejected()
    })
  })

  describe('getUserInfo', () => {
    it('should return data from api', () => {
      fakeAuth.get('/api/user/userName').reply(200, { username: 'result' })

      return expect(nomisClient.getUserInfo('userName')).to.eventually.eql({ username: 'result' })
    })

    it('should reject if api fails', () => {
      fakeAuth.get('/api/user/userName').reply(500)

      return expect(nomisClient.getUserInfo('userName')).to.be.rejected()
    })
  })

  describe('getLoggedInUserInfo', () => {
    it('should return data from api', () => {
      fakeAuth.get('/api/user/me').reply(200, { username: 'result' })

      return expect(nomisClient.getLoggedInUserInfo()).to.eventually.eql({ username: 'result' })
    })

    it('should reject if api fails', () => {
      fakeAuth.get('/api/user/me').reply(500)

      return expect(nomisClient.getLoggedInUserInfo()).to.be.rejected()
    })
  })

  describe('getUserRoles', () => {
    it('should return data from api', () => {
      fakeAuth.get('/api/user/me/roles').reply(200, { username: 'result' })

      return expect(nomisClient.getUserRoles()).to.eventually.eql({ username: 'result' })
    })

    it('should reject if api fails', () => {
      fakeAuth.get('/api/user/me/roles').reply(500)

      return expect(nomisClient.getUserRoles()).to.be.rejected()
    })
  })

  describe('getUserCaseLoads', () => {
    it('should return data from api', () => {
      fakeNomis.get('/users/me/caseLoads').reply(200, { username: 'result' })

      return expect(nomisClient.getUserCaseLoads()).to.eventually.eql({ username: 'result' })
    })

    it('should reject if api fails', () => {
      fakeNomis.get('/users/me/caseLoads').reply(500)

      return expect(nomisClient.getUserCaseLoads()).to.be.rejected()
    })
  })

  describe('putActiveCaseLoad', () => {
    it('should return data from api', () => {
      fakeNomis.put('/users/me/activeCaseLoad').reply(200, {})

      return expect(nomisClient.putActiveCaseLoad('id')).to.eventually.eql({})
    })

    it('should reject if api fails', () => {
      fakeNomis.put('/users/me/activeCaseLoad').reply(500)

      return expect(nomisClient.putActiveCaseLoad('id')).to.be.rejected()
    })
  })

  describe('putApprovalStatus', () => {
    let clock

    beforeEach(() => {
      clock = sinon.useFakeTimers(new Date('May 31, 2018 12:00:00').getTime())
    })

    afterEach(() => {
      clock.restore()
    })

    it('should inject bookingId into api endpoint', () => {
      fakeNomis
        .put('/offender-sentences/booking/aaa/home-detention-curfews/latest/approval-status')
        .reply(200, { result: 'answer' })

      return expect(
        nomisClient.putApprovalStatus('aaa', { approvalStatus: 'status', refusedReason: 'reason' })
      ).to.eventually.eql({ result: 'answer' })
    })

    it('should pass in the status and date but no reason if not specified', () => {
      fakeNomis
        .put('/offender-sentences/booking/aaa/home-detention-curfews/latest/approval-status', {
          approvalStatus: 'status',
          date: '2018-05-31',
        })
        .reply(200, { result: 'answer' })

      return expect(nomisClient.putApprovalStatus('aaa', { approvalStatus: 'status' })).to.eventually.eql({
        result: 'answer',
      })
    })

    it('should pass in the status, reason, and date', () => {
      fakeNomis
        .put('/offender-sentences/booking/aaa/home-detention-curfews/latest/approval-status', {
          approvalStatus: 'status',
          refusedReason: 'reason',
          date: '2018-05-31',
        })
        .reply(200, { result: 'answer' })

      return expect(
        nomisClient.putApprovalStatus('aaa', { approvalStatus: 'status', refusedReason: 'reason' })
      ).to.eventually.eql({ result: 'answer' })
    })
  })

  describe('putChecksPassed', () => {
    let clock

    beforeEach(() => {
      clock = sinon.useFakeTimers(new Date('May 31, 2018 12:00:00').getTime())
    })

    afterEach(() => {
      clock.restore()
    })

    it('should inject bookingId into api endpoint', () => {
      fakeNomis
        .put('/offender-sentences/booking/aaa/home-detention-curfews/latest/checks-passed')
        .reply(200, { result: 'answer' })

      return expect(nomisClient.putChecksPassed({ bookingId: 'aaa', passed: true })).to.eventually.eql({
        result: 'answer',
      })
    })

    it('should pass in passed value and date', () => {
      fakeNomis
        .put('/offender-sentences/booking/aaa/home-detention-curfews/latest/checks-passed', {
          passed: true,
          date: '2018-05-31',
        })
        .reply(200, { result: 'answer' })

      return expect(nomisClient.putChecksPassed({ bookingId: 'aaa', passed: true })).to.eventually.eql({
        result: 'answer',
      })
    })
  })
})
