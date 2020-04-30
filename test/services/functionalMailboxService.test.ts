import { FunctionalMailboxService } from '../../server/services/functionalMailboxService'
import { mockProbationTeamsClient, mockDeliusClient } from '../mockClients'

describe('FunctionalMailboxService', () => {
  describe('getLdusAndTeamsForProbationArea', () => {
    let deliusClient
    let probationTeamsClient
    let functionalMailboxService

    beforeEach(() => {
      deliusClient = mockDeliusClient()
      probationTeamsClient = mockProbationTeamsClient()
      functionalMailboxService = new FunctionalMailboxService(deliusClient, probationTeamsClient)
    })
  })
})
