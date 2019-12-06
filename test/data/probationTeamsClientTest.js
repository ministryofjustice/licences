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
      getAnonymousClientCredentialsTokens: sinon.stub().resolves('token'),
    }
    probationTeamsClient = createProbationTeamsClient(signInService)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('probationTeamsClient', () => {
    it('should throw error on GET when no token', async () => {
      signInService.getAnonymousClientCredentialsTokens.resolves(null)
      return expect(probationTeamsClient.getFunctionalMailbox('code-1')).to.be.rejectedWith(
        Error,
        /Failed to get token when attempting to call probationTeamsService: .*?\/local-delivery-units\/code-1\/functional-mailbox/
      )
    })

    describe('getFunctionalMailbox', () => {
      it('should return data from api', () => {
        fakeProbationTeamsService
          .get(`/local-delivery-units/code-1/functional-mailbox`)
          .reply(200, '"user@email.com"', { 'Content-Type': 'application/json' })

        return expect(probationTeamsClient.getFunctionalMailbox('code-1')).to.eventually.eql('user@email.com')
      })

      it('should reject if api fails', () => {
        fakeProbationTeamsService.get(`/local-delivery-units/code-1/functional-mailbox`).reply(500)

        return expect(probationTeamsClient.getFunctionalMailbox('code-1')).to.be.rejected()
      })

      it('should return null on 404', () => {
        fakeProbationTeamsService.get(`/local-delivery-units/code-1/functional-mailbox`).reply(404)

        return expect(probationTeamsClient.getFunctionalMailbox('code-1')).to.eventually.eql(null)
      })
    })
  })
})
