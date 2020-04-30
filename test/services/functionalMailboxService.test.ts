import { FunctionalMailboxService, mergeLduData } from '../../server/services/functionalMailboxService'
import { mockProbationTeamsClient, mockDeliusClient } from '../mockClients'

describe('FunctionalMailboxService', () => {
  describe('mergeLduData', () => {
    it('merges empty ldus and lduDtos', () => {
      expect(mergeLduData([], {})).toEqual({})
    })

    it('merges  ldus and lduDtos', () => {
      expect(
        mergeLduData(
          [
            { code: 'A', description: 'LDU A' },
            { code: 'B', description: 'LDU B' },
          ],
          {
            B: {
              probationAreaCode: 'PA',
              localDeliveryUnitCode: 'B',
              functionalMailbox: 'b@b.com',
              probationTeams: {},
            },
            C: {
              probationAreaCode: 'PA',
              localDeliveryUnitCode: 'C',
              functionalMailbox: 'c@b.com',
              probationTeams: {},
            },
          }
        )
      ).toEqual({
        A: {
          description: 'LDU A',
        },
        B: {
          description: 'LDU B',
          functionalMailbox: 'b@b.com',
        },
        C: {
          functionalMailbox: 'c@b.com',
        },
      })
    })
  })

  describe('getLdusForProbationArea', () => {
    let deliusClient
    let probationTeamsClient
    let functionalMailboxService

    beforeEach(() => {
      deliusClient = mockDeliusClient()
      probationTeamsClient = mockProbationTeamsClient()
      functionalMailboxService = new FunctionalMailboxService(deliusClient, probationTeamsClient)
    })

    it('Merges data', async () => {
      deliusClient.getAllLdusForProbationArea.mockResolvedValue({
        content: [{ code: 'B', description: 'LDU B' }],
      })
      probationTeamsClient.getProbationArea.mockResolvedValue({
        probationAreaCode: 'PA',
        localDeliveryUnits: {
          B: { probationAreaCode: 'PA', localDeliveryUnitCode: 'B', functionalMailbox: 'b@b.com' },
        },
      })

      expect(await functionalMailboxService.getLdusForProbationArea('PA')).toEqual({
        B: {
          description: 'LDU B',
          functionalMailbox: 'b@b.com',
        },
      })
    })

    it('Handles missing data', async () => {
      deliusClient.getAllLdusForProbationArea.mockResolvedValue(undefined)
      probationTeamsClient.getProbationArea.mockResolvedValue(undefined)

      expect(await functionalMailboxService.getLdusForProbationArea('PA')).toEqual({})
    })
  })
})
