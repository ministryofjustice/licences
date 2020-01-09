const nock = require('nock')

const config = require('../../server/config')
const createProbationTeamsClient = require('../../server/data/probationTeamsClient')

describe('probationTeamsClient', () => {
  let fakeProbationTeamsService
  let probationTeamsClient
  let signInService

  beforeEach(() => {
    fakeProbationTeamsService = nock(`${config.probationTeams.apiUrl}`)
    signInService = {
      getAnonymousClientCredentialsTokens: jest.fn().mockReturnValue('token'),
    }
    probationTeamsClient = createProbationTeamsClient(signInService)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('probationTeamsClient', () => {
    test('should throw error on GET when no token', async () => {
      signInService.getAnonymousClientCredentialsTokens.mockResolvedValue(null)
      return expect(probationTeamsClient.getFunctionalMailbox('AREA_CODE', 'LDU_CODE')).rejects.toThrow(
        Error,
        /Failed to get token when attempting to call probationTeamsService: .*?\/probation-areas\/AREA_CODE\/local-delivery-units\/LDU_CODE/
      )
    })

    describe('getFunctionalMailbox', () => {
      test('should return data from api', () => {
        fakeProbationTeamsService
          .get('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE')
          .reply(
            200,
            '{"probationAreaCode": "AREA_CODE","localDeliveryUnitCode":"LDU_CODE","functionalMailbox":"user@email.com"}',
            { 'Content-Type': 'application/json' }
          )

        return expect(probationTeamsClient.getFunctionalMailbox('AREA_CODE', 'LDU_CODE')).resolves.toStrictEqual(
          'user@email.com'
        )
      })

      test('should reject if api fails', () => {
        fakeProbationTeamsService.get('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE').reply(500)

        return expect(probationTeamsClient.getFunctionalMailbox('AREA_CODE', 'LDU_CODE')).rejects.toStrictEqual(
          Error('Internal Server Error')
        )
      })

      test('should return undefined on 404', () => {
        fakeProbationTeamsService.get('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE').reply(404)

        return expect(probationTeamsClient.getFunctionalMailbox('AREA_CODE', 'LDU_CODE')).resolves.toStrictEqual(
          undefined
        )
      })
    })
  })
})
