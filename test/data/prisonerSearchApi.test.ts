import nock from 'nock'
import config from '../../server/config'
import prisonerSearchApi from '../../server/data/prisonerSearchApi'
import { unauthorisedError } from '../../server/utils/errors'

describe('prisonerSearchApi', () => {
  let fakeprisonerSearch
  let client

  beforeEach(() => {
    fakeprisonerSearch = nock(`${config.prisonerSearchApi.apiUrl}`)
    client = prisonerSearchApi('token')
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getPrisoners', () => {
    const record = (id) => ({ id, sentenceDetail: {} })

    test('should throw error when no token', () => {
      const badClient = prisonerSearchApi(undefined)
      return expect(badClient.getPrisoners([1])).rejects.toThrow(unauthorisedError())
    })

    test(`Doesn't call api if no booking ids`, async () => {
      const result = await client.getPrisoners([])
      return expect(result).toStrictEqual([])
    })

    test('should return data from api', async () => {
      fakeprisonerSearch.post('/prisoner-search/booking-ids').reply(200, [record(1), record(2)])

      const result = await client.getPrisoners([1, 2])
      const ids = result.map(({ id }) => id)
      return expect(ids).toStrictEqual([1, 2])
    })

    test('should batch data from api', async () => {
      const batchSize = 3

      fakeprisonerSearch.post('/prisoner-search/booking-ids').reply(200, [record(1), record(2), record(3)])
      fakeprisonerSearch.post('/prisoner-search/booking-ids').reply(200, [record(4), record(5), record(6)])
      fakeprisonerSearch.post('/prisoner-search/booking-ids').reply(200, [record(7), record(8)])

      const result = await client.getPrisoners([1, 2, 3, 4, 5, 6, 7, 8], batchSize)

      const ids = result.map(({ id }) => id)
      expect(ids).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    test('should reject if api fails', () => {
      fakeprisonerSearch.post('/prisoner-search/booking-ids').thrice().reply(500)

      return expect(client.getPrisoners([1, 2])).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })
})
