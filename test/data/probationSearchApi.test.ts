import nock from 'nock'
import config from '../../server/config'
import probationSearchApi from '../../server/data/probationSearchApi'
import { unauthorisedError } from '../../server/utils/errors'

describe('probationSearchApi', () => {
  let fakeProbationSearch
  let client

  beforeEach(() => {
    fakeProbationSearch = nock(`${config.probationSearchApi.apiUrl}`)
    client = probationSearchApi('token')
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getPersonProbationDetails', () => {
    const record = (id) => ({ id, items: {} })

    test('should throw error when no token', () => {
      const badClient = probationSearchApi(undefined)
      return expect(badClient.getPersonProbationDetails(['1'])).rejects.toThrow(unauthorisedError())
    })

    test(`Doesn't call api if no offender numbers`, async () => {
      const result = await client.getPersonProbationDetails([])
      return expect(result).toStrictEqual([])
    })

    test('should return data from api', async () => {
      fakeProbationSearch.post('/nomsNumbers').reply(200, [record('1'), record('2')])

      const result = await client.getPersonProbationDetails(['1', '2'])
      const ids = result.map(({ id }) => id)
      return expect(ids).toStrictEqual(['1', '2'])
    })

    test('should batch data from api', async () => {
      const batchSize = 3

      fakeProbationSearch.post('/nomsNumbers').reply(200, [record('1'), record('2'), record('3')])
      fakeProbationSearch.post('/nomsNumbers').reply(200, [record('4'), record('5'), record('6')])
      fakeProbationSearch.post('/nomsNumbers').reply(200, [record('7'), record('8')])

      const result = await client.getPersonProbationDetails(['1', '2', '3', '4', '5', '6', '7', '8'], batchSize)

      const ids = result.map(({ id }) => id)
      expect(ids).toStrictEqual(['1', '2', '3', '4', '5', '6', '7', '8'])
    })

    test('should reject if api fails', () => {
      fakeProbationSearch.post('/nomsNumbers').thrice().reply(500)

      return expect(client.getPersonProbationDetails(['1', '2'])).rejects.toStrictEqual(Error('Internal Server Error'))
    })
  })
})
