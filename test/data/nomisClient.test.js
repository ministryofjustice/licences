const nock = require('nock')

const config = require('../../server/config')
const nomisClientBuilder = require('../../server/data/nomisClientBuilder')
const { unauthorisedError } = require('../../server/utils/errors')

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
      const badClient = nomisClientBuilder(undefined)
      return expect(badClient.getBooking('1')).rejects.toThrow(unauthorisedError())
    })

    test('should throw error on POST when no token', () => {
      const badClient = nomisClientBuilder(undefined)
      return expect(badClient.getOffenderSentencesByBookingId(['1'])).rejects.toThrow(unauthorisedError())
    })

    test('should throw error on PUT when no token', () => {
      const badClient = nomisClientBuilder(undefined)
      return expect(badClient.putActiveCaseLoad('1')).rejects.toThrow(unauthorisedError())
    })
  })

  describe('getBooking', () => {
    test('should return data from api', () => {
      fakeNomis.get(`/api/bookings/1`).reply(200, { key: 'value' })

      return expect(nomisClient.getBooking('1')).resolves.toEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeNomis.get(`/api/bookings/1`).thrice().reply(500)

      return expect(nomisClient.getBooking('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })

    test('handling 400', () => {
      fakeNomis.get(`/api/bookings/1`).times(3).reply(400, { error: 'some-reason' })

      return expect(nomisClient.getBooking('1')).rejects.toStrictEqual(Error('Bad Request'))
    })
  })

  describe('getOffenderSentencesByNomisId', () => {
    const record = (id) => ({ id, sentenceDetail: {} })

    test(`Doesn't call api if no offender numbers`, async () => {
      const result = await nomisClient.getOffenderSentencesByNomisId([])
      expect(result).toStrictEqual([])
    })

    test('should return data from api', async () => {
      fakeNomis.get(`/api/offender-sentences?offenderNo=1&offenderNo=2`).reply(200, [record(1), record(2)])

      const result = await nomisClient.getOffenderSentencesByNomisId(['1', '2'])
      const ids = result.map(({ id }) => id)
      expect(ids).toStrictEqual([1, 2])
    })

    test('should batch data from api', async () => {
      const batchSize = 3

      fakeNomis
        .get(`/api/offender-sentences?offenderNo=1&offenderNo=2&offenderNo=3`)
        .reply(200, [record(1), record(2), record(3)])
      fakeNomis
        .get(`/api/offender-sentences?offenderNo=4&offenderNo=5&offenderNo=6`)
        .reply(200, [record(4), record(5), record(6)])
      fakeNomis.get(`/api/offender-sentences?offenderNo=7&offenderNo=8`).reply(200, [record(7), record(8)])

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
      fakeNomis.get(`/api/bookings/offenderNo/ABC123D`).reply(200, { key: 'value' })

      return expect(nomisClient.getBookingByOffenderNumber('ABC123D')).resolves.toEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeNomis.get(`/api/bookings/offenderNo/ABC123D`).thrice().reply(500)

      return expect(nomisClient.getBookingByOffenderNumber('ABC123D')).rejects.toStrictEqual(
        Error('Internal Server Error')
      )
    })
  })

  describe('getImageInfo', () => {
    test('should return data from api', () => {
      fakeNomis.get(`/api/images/1`).reply(200, { key: 'value' })

      return expect(nomisClient.getImageInfo('1')).resolves.toEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeNomis.get(`/api/images/1`).thrice().reply(500)

      return expect(nomisClient.getImageInfo('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getImageData', () => {
    test('should return a buffer', () => {
      fakeNomis.get(`/api/images/1/data`).reply(200, Buffer.from([0, 1, 2, 3, 4]), { 'Content-Type': 'image/jpeg' })

      return expect(nomisClient.getImageData('1')).resolves.toEqual(Buffer.from([0, 1, 2, 3, 4]))
    })

    test('should throw if not found', () => {
      fakeNomis.get(`/api/images/1/data`).reply(404)

      return expect(nomisClient.getImageData('1')).rejects.toStrictEqual(Error('Not Found'))
    })

    test('should throw if api fails', () => {
      fakeNomis.get(`/api/images/1/data`).thrice().reply(500)

      return expect(nomisClient.getImageData('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getHdcEligiblePrisoners', () => {
    const url = '/api/offender-sentences/home-detention-curfew-candidates'

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
      fakeNomis.get(url).thrice().reply(500)

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
      fakeNomis.get(`/api/bookings/1/aliases`).reply(200, { key: 'value' })

      return expect(nomisClient.getAliases('1')).resolves.toEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeNomis.get(`/api/bookings/1/aliases`).thrice().reply(500)

      return expect(nomisClient.getAliases('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getIdentifiers', () => {
    test('should return data from api', () => {
      fakeNomis.get(`/api/bookings/1/identifiers`).reply(200, [{ key: '1' }, { key: '2' }])

      return expect(nomisClient.getIdentifiers('1')).resolves.toEqual([{ key: '1' }, { key: '2' }])
    })

    test('should reject if api fails', () => {
      fakeNomis.get(`/api/bookings/1/identifiers`).thrice().reply(500)

      return expect(nomisClient.getIdentifiers('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getMainOffence', () => {
    test('should return data from api', () => {
      fakeNomis.get(`/api/bookings/1/mainOffence`).reply(200, { key: 'value' })

      return expect(nomisClient.getMainOffence('1')).resolves.toEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeNomis.get(`/api/bookings/1/mainOffence`).thrice().reply(500)

      return expect(nomisClient.getMainOffence('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getEstablishment', () => {
    test('should return data from api', () => {
      fakeNomis.get(`/api/agencies/prison/1`).reply(200, { key: 'value' })

      return expect(nomisClient.getEstablishment('1')).resolves.toEqual({ key: 'value' })
    })

    test('should reject if api fails', () => {
      fakeNomis.get(`/api/agencies/prison/1`).thrice().reply(500)

      return expect(nomisClient.getEstablishment('1')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('token refreshing', () => {
    let realDateNow

    beforeEach(() => {
      const time = new Date('May 31, 2018 12:00:00')
      jest.spyOn(Date, 'now').mockImplementation(() => time.getTime())
      realDateNow = Date.now.bind(global.Date)
    })

    afterEach(() => {
      global.Date.now = realDateNow
    })

    test('should not try to refresh twice in a row', () => {
      fakeNomis.get(`/api/agencies/prison/1`).reply(401).get(`/api/agencies/prison/1`).reply(401, { response: 'this' })

      return expect(nomisClient.getEstablishment('1')).rejects.toStrictEqual(unauthorisedError())
    })
  })

  describe('getOffenderSentencesByBookingId', () => {
    test('should return data from api', () => {
      fakeNomis
        .post(`/api/offender-sentences/bookings`, ['1'])
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
        .post(`/api/offender-sentences/bookings`, ['1'])
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
      fakeNomis.post(`/api/offender-sentences/bookings`, ['1']).reply(500)

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
      fakeAuth.get('/api/user/userName').thrice().reply(500)

      return expect(nomisClient.getUserInfo('userName')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getLoggedInUserInfo', () => {
    test('should return data from api', () => {
      fakeAuth.get('/api/user/me').reply(200, { username: 'result' })

      return expect(nomisClient.getLoggedInUserInfo()).resolves.toEqual({ username: 'result' })
    })

    test('should reject if api fails', () => {
      fakeAuth.get('/api/user/me').thrice().reply(500)

      return expect(nomisClient.getLoggedInUserInfo()).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getUserRoles', () => {
    test('should return data from api', () => {
      fakeAuth.get('/api/user/me/roles').reply(200, { username: 'result' })

      return expect(nomisClient.getUserRoles()).resolves.toEqual({ username: 'result' })
    })

    test('should reject if api fails', () => {
      fakeAuth.get('/api/user/me/roles').thrice().reply(500)

      return expect(nomisClient.getUserRoles()).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('getUserCaseLoads', () => {
    test('should return data from api', () => {
      fakeNomis.get('/api/users/me/caseLoads').reply(200, { username: 'result' })

      return expect(nomisClient.getUserCaseLoads()).resolves.toEqual({ username: 'result' })
    })

    test('should reject if api fails', () => {
      fakeNomis.get('/api/users/me/caseLoads').thrice().reply(500)

      return expect(nomisClient.getUserCaseLoads()).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('putActiveCaseLoad', () => {
    test('should return data from api', () => {
      fakeNomis.put('/api/users/me/activeCaseLoad').reply(200, {})

      /* The PUT request returns '{}'.  Why? It doesn't serve any purpose.
       * The current implementation of restClientBuilder.putResource doesn't return any value (and we don't care anyway)
       * so changed the test below to just confirm that the PUT resolves.
       */
      return expect(nomisClient.putActiveCaseLoad('id')).resolves.toBeUndefined()
    })

    test('should reject if api fails', () => {
      fakeNomis.put('/api/users/me/activeCaseLoad').thrice().reply(500)

      return expect(nomisClient.putActiveCaseLoad('id')).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })

  describe('putApprovalStatus', () => {
    let realDateNow

    beforeEach(() => {
      const time = new Date('May 31, 2018 12:00:00')
      realDateNow = Date.now.bind(global.Date)
      jest.spyOn(Date, 'now').mockImplementation(() => time.getTime())
    })

    afterEach(() => {
      global.Date.now = realDateNow
    })

    test('should inject bookingId into api endpoint', async () => {
      fakeNomis
        .put('/api/offender-sentences/booking/aaa/home-detention-curfews/latest/approval-status', {
          approvalStatus: 'status',
          refusedReason: 'reason',
          date: '2018-05-31',
        })
        .reply(200)

      const response = await nomisClient.putApprovalStatus('aaa', { approvalStatus: 'status', refusedReason: 'reason' })
      expect(response).toBeUndefined()
      expect(fakeNomis.isDone()).toBeTruthy()
    })

    test('should pass in the status and date but no reason if not specified', async () => {
      fakeNomis
        .put('/api/offender-sentences/booking/aaa/home-detention-curfews/latest/approval-status', {
          approvalStatus: 'status',
          date: '2018-05-31',
        })
        .reply(200)

      const response = await nomisClient.putApprovalStatus('aaa', { approvalStatus: 'status' })
      expect(response).toBeUndefined()
      expect(fakeNomis.isDone()).toBeTruthy()
    })

    test('should pass in the status, reason, and date', async () => {
      fakeNomis
        .put('/api/offender-sentences/booking/aaa/home-detention-curfews/latest/approval-status', {
          approvalStatus: 'status',
          refusedReason: 'reason',
          date: '2018-05-31',
        })
        .reply(200)

      const response = await nomisClient.putApprovalStatus('aaa', { approvalStatus: 'status', refusedReason: 'reason' })
      expect(response).toBeUndefined()
      expect(fakeNomis.isDone()).toBeTruthy()
    })
  })

  describe('putChecksPassed', () => {
    let realDateNow

    beforeEach(() => {
      const time = new Date('May 31, 2018 12:00:00')
      realDateNow = Date.now.bind(global.Date)
      jest.spyOn(Date, 'now').mockImplementation(() => time.getTime())
    })

    afterEach(() => {
      global.Date.now = realDateNow
    })

    test('should inject bookingId into api endpoint', async () => {
      fakeNomis.put('/api/offender-sentences/booking/aaa/home-detention-curfews/latest/checks-passed').reply(200)

      const result = await nomisClient.putChecksPassed({ bookingId: 'aaa', passed: true })
      expect(result).toBeUndefined()
      expect(fakeNomis.isDone()).toBeTruthy()
    })

    test('should pass in passed value and date', async () => {
      fakeNomis
        .put('/api/offender-sentences/booking/aaa/home-detention-curfews/latest/checks-passed', {
          passed: true,
          date: '2018-05-31',
        })
        .reply(200)

      const result = await nomisClient.putChecksPassed({ bookingId: 'aaa', passed: true })
      expect(result).toBeUndefined()
      expect(fakeNomis.isDone()).toBeTruthy()
    })

    test('should throw error if passed is not boolean', () => {
      return expect(nomisClient.putChecksPassed({ bookingId: 'aaa', passed: 0 })).rejects.toThrow(
        `Missing required input parameter 'passed'`
      )
    })
  })
})
