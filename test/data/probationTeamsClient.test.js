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
      return expect(probationTeamsClient.getFunctionalMailbox('code-1')).rejects.toThrow(
        Error,
        /Failed to get token when attempting to call probationTeamsService: .*?\/local-delivery-units\/code-1\/functional-mailbox/
      )
    })

    describe('getFunctionalMailbox', () => {
      test('should return data from api', () => {
        fakeProbationTeamsService
          .get(`/local-delivery-units/code-1/functional-mailbox`)
          .reply(200, '"user@email.com"', { 'Content-Type': 'application/json' })

        return expect(probationTeamsClient.getFunctionalMailbox('code-1')).resolves.toStrictEqual('user@email.com')
      })

      test('should reject if api fails', () => {
        fakeProbationTeamsService.get(`/local-delivery-units/code-1/functional-mailbox`).reply(500)

        return expect(probationTeamsClient.getFunctionalMailbox('code-1')).rejects.toStrictEqual(
          Error('Internal Server Error')
        )
      })

      test('should return null on 404', () => {
        fakeProbationTeamsService.get(`/local-delivery-units/code-1/functional-mailbox`).reply(404)

        return expect(probationTeamsClient.getFunctionalMailbox('code-1')).resolves.toStrictEqual(null)
      })
    })
  })
})
