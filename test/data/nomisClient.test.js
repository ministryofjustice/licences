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

  describe('nomisClient', () => {
    test('should throw error on GET when no token', () => {
      const badClient = nomisClientBuilder()
      return expect(badClient.getBooking('1')).rejects.toThrow('Unauthorised access')
    })

    test('should throw error on POST when no token', () => {
      const badClient = nomisClientBuilder()
      return expect(badClient.getOffenderSentencesByBookingId(['1'])).rejects.toThrow('Unauthorised access')
    })

    test('should throw error on PUT when no token', () => {
      const badClient = nomisClientBuilder()
      return expect(badClient.putActiveCaseLoad('1')).rejects.toThrow('Unauthorised access')
    })
  })

  describe('getBooking', () => {
    test('should return data from api', () => {
      fakeNomis.get(`/bookings/1`).reply(200, { key: 'value' })

      return expect(nomisClient.getBooking('1')).resolves.toEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeNomis
        .get(`/bookings/1`)
        .thrice()
        .reply(500)

      return expect(nomisClient.getBooking('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })

    test('handling 400', () => {
      fakeNomis.get(`/bookings/1`).reply(400, { error: 'some-reason' })

      return expect(nomisClient.getBooking('1')).rejects.toStrictEqual(Error('Bad Request'))
    })
  })

  describe('getOffenderSentencesByNomisId', () => {
    const record = id => ({ id, sentenceDetail: {} })

    test(`Doesn't call api if no offender numbers`, async () => {
      const result = await nomisClient.getOffenderSentencesByNomisId([])
      expect(result).toStrictEqual([])
    })

    test('should return data from api', async () => {
      fakeNomis.get(`/offender-sentences?offenderNo=1&offenderNo=2`).reply(200, [record(1), record(2)])

      const result = await nomisClient.getOffenderSentencesByNomisId(['1', '2'])
      const ids = result.map(({ id }) => id)
      expect(ids).toStrictEqual([1, 2])
    })

    test('should batch data from api', async () => {
      const batchSize = 3

      fakeNomis
        .get(`/offender-sentences?offenderNo=1&offenderNo=2&offenderNo=3`)
        .reply(200, [record(1), record(2), record(3)])
      fakeNomis
        .get(`/offender-sentences?offenderNo=4&offenderNo=5&offenderNo=6`)
        .reply(200, [record(4), record(5), record(6)])
      fakeNomis.get(`/offender-sentences?offenderNo=7&offenderNo=8`).reply(200, [record(7), record(8)])

      const result = await nomisClient.getOffenderSentencesByNomisId(
        ['1', '2', '3', '4', '5', '6', '7', '8'],
        batchSize
      )

      const ids = result.map(({ id }) => id)
      expect(ids).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })
  })

  describe('getBookingByOffenderNumber', () => {
    test('should return data from api', () => {
      fakeNomis.get(`/bookings/offenderNo/ABC123D`).reply(200, { key: 'value' })

      return expect(nomisClient.getBookingByOffenderNumber('ABC123D')).resolves.toEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeNomis
        .get(`/bookings/offenderNo/ABC123D`)
        .thrice()
        .reply(500)

      return expect(nomisClient.getBookingByOffenderNumber('ABC123D')).rejects.toStrictEqual(
        Error('Internal Server Error')
      )
    })
  })

  describe('getImageInfo', () => {
    test('should return data from api', () => {
      fakeNomis.get(`/images/1`).reply(200, { key: 'value' })

      return expect(nomisClient.getImageInfo('1')).resolves.toEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeNomis
        .get(`/images/1`)
        .thrice()
        .reply(500)

      return expect(nomisClient.getImageInfo('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getImageData', () => {
    test('should return a buffer', () => {
      fakeNomis.get(`/images/1/data`).reply(200, 'image')

      return expect(nomisClient.getImageData('1')).resolves.toEqual(Buffer.from('image'))
    })

    test('should throw if not found', () => {
      fakeNomis.get(`/images/1/data`).reply(404)

      return expect(nomisClient.getImageData('1')).rejects.toStrictEqual(Error('Not Found'))
    })

    test('should throw if api fails', () => {
      fakeNomis
        .get(`/images/1/data`)
        .thrice()
        .reply(500)

      return expect(nomisClient.getImageData('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getHdcEligiblePrisoners', () => {
    const url = '/offender-sentences/home-detention-curfew-candidates'

    test('should return data from api', () => {
      fakeNomis.get(url).reply(200, [
        {
          sentenceDetail: {
            conditionalReleaseDate: 'a',
          },
        },
      ])

      return expect(nomisClient.getHdcEligiblePrisoners()).resolves.toEqual([
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

    test('should reject if api fails', () => {
      fakeNomis
        .get(url)
        .thrice()
        .reply(500)

      return expect(nomisClient.getHdcEligiblePrisoners()).rejects.toStrictEqual(Error('Internal Server Error'))
    })

    test('should set releaseDate as CRDOverride if present', () => {
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

      return expect(nomisClient.getHdcEligiblePrisoners()).resolves.toEqual([
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

    test('should set releaseDate as CRD if no CRDOverride is present', () => {
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

      return expect(nomisClient.getHdcEligiblePrisoners()).resolves.toEqual([
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

    test('should set releaseDate as ARDOverride if no CRD is present', () => {
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

      return expect(nomisClient.getHdcEligiblePrisoners()).resolves.toEqual([
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

    test('should set releaseDate as ARD if no CRD or ARDOverride is present', () => {
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

      return expect(nomisClient.getHdcEligiblePrisoners()).resolves.toEqual([
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
    test('should return data from api', () => {
      fakeNomis.get(`/bookings/1/aliases`).reply(200, { key: 'value' })

      return expect(nomisClient.getAliases('1')).resolves.toEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeNomis
        .get(`/bookings/1/aliases`)
        .thrice()
        .reply(500)

      return expect(nomisClient.getAliases('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getIdentifiers', () => {
    test('should return data from api', () => {
      fakeNomis.get(`/bookings/1/identifiers`).reply(200, [{ key: '1' }, { key: '2' }])

      return expect(nomisClient.getIdentifiers('1')).resolves.toEqual([{ key: '1' }, { key: '2' }])
    })

    test('should reject if api fails', () => {
      fakeNomis
        .get(`/bookings/1/identifiers`)
        .thrice()
        .reply(500)

      return expect(nomisClient.getIdentifiers('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getMainOffence', () => {
    test('should return data from api', () => {
      fakeNomis.get(`/bookings/1/mainOffence`).reply(200, { key: 'value' })

      return expect(nomisClient.getMainOffence('1')).resolves.toEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeNomis
        .get(`/bookings/1/mainOffence`)
        .thrice()
        .reply(500)

      return expect(nomisClient.getMainOffence('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getEstablishment', () => {
    test('should return data from api', () => {
      fakeNomis.get(`/agencies/prison/1`).reply(200, { key: 'value' })

      return expect(nomisClient.getEstablishment('1')).resolves.toEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeNomis
        .get(`/agencies/prison/1`)
        .thrice()
        .reply(500)

      return expect(nomisClient.getEstablishment('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('token refreshing', () => {
    let realDateNow

    beforeEach(() => {
      const time = new Date('May 31, 2018 12:00:00')
      realDateNow = Date.now.bind(global.Date)
      global.Date = jest.fn(() => time)
    })

    afterEach(() => {
      global.Date.now = realDateNow
    })

    test('should not try to refresh twice in a row', () => {
      fakeNomis
        .get(`/agencies/prison/1`)
        .reply(401)
        .get(`/agencies/prison/1`)
        .reply(401, { response: 'this' })

      return expect(nomisClient.getEstablishment('1')).rejects.toStrictEqual(Error('Unauthorized'))
    })
  })

  describe('getOffenderSentencesByBookingId', () => {
    test('should return data from api', () => {
      fakeNomis
        .post(`/offender-sentences/bookings`, ['1'])
        .reply(200, [{ sentenceDetail: { conditionalReleaseDate: 'a' } }])

      return expect(nomisClient.getOffenderSentencesByBookingId(['1'])).resolves.toEqual([
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

    test('should return data from api without release dates if disabled', () => {
      fakeNomis
        .post(`/offender-sentences/bookings`, ['1'])
        .reply(200, [{ sentenceDetail: { conditionalReleaseDate: 'a' } }])

      return expect(nomisClient.getOffenderSentencesByBookingId(['1'], false)).resolves.toEqual([
        {
          sentenceDetail: {
            conditionalReleaseDate: 'a',
          },
        },
      ])
    })

    test('should reject if api fails', () => {
      fakeNomis.post(`/offender-sentences/bookings`, ['1']).reply(500)

      return expect(nomisClient.getOffenderSentencesByBookingId(['1'])).rejects.toStrictEqual(
        Error('Internal Server Error')
      )
    })
  })

  describe('getUserInfo', () => {
    test('should return data from api', () => {
      fakeAuth.get('/api/user/userName').reply(200, { username: 'result' })

      return expect(nomisClient.getUserInfo('userName')).resolves.toEqual({ username: 'result' })
    })

    test('should reject if api fails', () => {
      fakeAuth
        .get('/api/user/userName')
        .thrice()
        .reply(500)

      return expect(nomisClient.getUserInfo('userName')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getLoggedInUserInfo', () => {
    test('should return data from api', () => {
      fakeAuth.get('/api/user/me').reply(200, { username: 'result' })

      return expect(nomisClient.getLoggedInUserInfo()).resolves.toEqual({ username: 'result' })
    })

    test('should reject if api fails', () => {
      fakeAuth
        .get('/api/user/me')
        .thrice()
        .reply(500)

      return expect(nomisClient.getLoggedInUserInfo()).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getUserRoles', () => {
    test('should return data from api', () => {
      fakeAuth.get('/api/user/me/roles').reply(200, { username: 'result' })

      return expect(nomisClient.getUserRoles()).resolves.toEqual({ username: 'result' })
    })

    test('should reject if api fails', () => {
      fakeAuth
        .get('/api/user/me/roles')
        .thrice()
        .reply(500)

      return expect(nomisClient.getUserRoles()).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getUserCaseLoads', () => {
    test('should return data from api', () => {
      fakeNomis.get('/users/me/caseLoads').reply(200, { username: 'result' })

      return expect(nomisClient.getUserCaseLoads()).resolves.toEqual({ username: 'result' })
    })

    test('should reject if api fails', () => {
      fakeNomis
        .get('/users/me/caseLoads')
        .thrice()
        .reply(500)

      return expect(nomisClient.getUserCaseLoads()).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('putActiveCaseLoad', () => {
    test('should return data from api', () => {
      fakeNomis.put('/users/me/activeCaseLoad').reply(200, {})

      return expect(nomisClient.putActiveCaseLoad('id')).resolves.toEqual({})
    })

    test('should reject if api fails', () => {
      fakeNomis
        .put('/users/me/activeCaseLoad')
        .thrice()
        .reply(500)

      return expect(nomisClient.putActiveCaseLoad('id')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('putApprovalStatus', () => {
    let realDateNow

    beforeEach(() => {
      const time = new Date('May 31, 2018 12:00:00')
      realDateNow = Date.now.bind(global.Date)
      global.Date = jest.fn(() => time)
    })

    afterEach(() => {
      global.Date.now = realDateNow
    })

    test('should inject bookingId into api endpoint', () => {
      fakeNomis
        .put('/offender-sentences/booking/aaa/home-detention-curfews/latest/approval-status')
        .reply(200, { result: 'answer' })

      return expect(
        nomisClient.putApprovalStatus('aaa', { approvalStatus: 'status', refusedReason: 'reason' })
      ).resolves.toEqual({ result: 'answer' })
    })

    test('should pass in the status and date but no reason if not specified', () => {
      fakeNomis
        .put('/offender-sentences/booking/aaa/home-detention-curfews/latest/approval-status', {
          approvalStatus: 'status',
          date: '2018-05-31',
        })
        .reply(200, { result: 'answer' })

      return expect(nomisClient.putApprovalStatus('aaa', { approvalStatus: 'status' })).resolves.toEqual({
        result: 'answer',
      })
    })

    test('should pass in the status, reason, and date', () => {
      fakeNomis
        .put('/offender-sentences/booking/aaa/home-detention-curfews/latest/approval-status', {
          approvalStatus: 'status',
          refusedReason: 'reason',
          date: '2018-05-31',
        })
        .reply(200, { result: 'answer' })

      return expect(
        nomisClient.putApprovalStatus('aaa', { approvalStatus: 'status', refusedReason: 'reason' })
      ).resolves.toEqual({ result: 'answer' })
    })
  })

  describe('putChecksPassed', () => {
    let realDateNow

    beforeEach(() => {
      const time = new Date('May 31, 2018 12:00:00')
      realDateNow = Date.now.bind(global.Date)
      global.Date = jest.fn(() => time)
    })

    afterEach(() => {
      global.Date.now = realDateNow
    })

    test('should inject bookingId into api endpoint', () => {
      fakeNomis
        .put('/offender-sentences/booking/aaa/home-detention-curfews/latest/checks-passed')
        .reply(200, { result: 'answer' })

      return expect(nomisClient.putChecksPassed({ bookingId: 'aaa', passed: true })).resolves.toEqual({
        result: 'answer',
      })
    })

    test('should pass in passed value and date', () => {
      fakeNomis
        .put('/offender-sentences/booking/aaa/home-detention-curfews/latest/checks-passed', {
          passed: true,
          date: '2018-05-31',
        })
        .reply(200, { result: 'answer' })

      return expect(nomisClient.putChecksPassed({ bookingId: 'aaa', passed: true })).resolves.toEqual({
        result: 'answer',
      })
    })

    test('should throw error if passed is not boolean', () => {
      return expect(nomisClient.putChecksPassed({ bookingId: 'aaa', passed: 0 })).rejects.toThrow(
        `Missing required input parameter 'passed'`
      )
    })
  })
})
