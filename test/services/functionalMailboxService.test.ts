import {
  FunctionalMailboxService,
  mergeLduData,
  mergeProbationAreaData,
} from '../../server/services/functionalMailboxService'
import { mockDeliusClient, mockProbationTeamsClient } from '../mockClients'

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

  describe('mergeProbationAreaData', () => {
    const institution = Object.freeze({
      institutionId: 1,
      isEstablishment: false,
      code: 'I1',
      description: 'I1',
      institutionName: 'I1',
      establishmentType: { code: 'I1', description: 'I1' },
      isPrivate: false,
    })

    const baseProbationArea = {
      probationAreaId: 1,
      nps: false,
      institution,
      organisation: { code: 'org', description: 'org' },
      teams: [],
    }

    it('merges empty data sets', () => {
      expect(mergeProbationAreaData([], [])).toEqual({})
    })

    it('merges overlapping data sets', () => {
      expect(
        mergeProbationAreaData(
          [
            {
              ...baseProbationArea,
              code: 'A',
              description: 'PA A',
              probationAreaId: 1,
            },
            {
              ...baseProbationArea,
              code: 'B',
              description: 'PA B',
              probationAreaId: 2,
            },
          ],
          ['B', 'C']
        )
      ).toEqual({
        A: {
          description: 'PA A',
        },
        B: {
          description: 'PA B',
        },
        C: {},
      })
    })
  })

  describe('getAllProbationAreas', () => {
    let deliusClient
    let probationTeamsClient
    let functionalMailboxService

    beforeEach(() => {
      deliusClient = mockDeliusClient()
      probationTeamsClient = mockProbationTeamsClient()
      functionalMailboxService = new FunctionalMailboxService(deliusClient, probationTeamsClient)
    })

    it('Happy path', async () => {
      deliusClient.getAllProbationAreas.mockResolvedValue({
        content: [
          { code: 'A', description: 'PA A' },
          { code: 'B', description: 'PA B' },
        ],
      })
      probationTeamsClient.getProbationAreaCodes.mockResolvedValue(['B', 'C'])

      expect(await functionalMailboxService.getAllProbationAreas()).toEqual({
        A: {
          description: 'PA A',
        },
        B: {
          description: 'PA B',
        },
        C: {},
      })
    })

    it('absent data', async () => {
      deliusClient.getAllProbationAreas.mockResolvedValue(undefined)
      probationTeamsClient.getProbationAreaCodes.mockResolvedValue(undefined)

      expect(await functionalMailboxService.getAllProbationAreas()).toEqual({})
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

    it('Happy path', async () => {
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

  describe('getLduWithTeams', () => {
    let deliusClient
    let probationTeamsClient
    let functionalMailboxService

    beforeEach(() => {
      deliusClient = mockDeliusClient()
      probationTeamsClient = mockProbationTeamsClient()
      functionalMailboxService = new FunctionalMailboxService(deliusClient, probationTeamsClient)
    })

    it('Happy path', async () => {
      deliusClient.getAllLdusForProbationArea.mockResolvedValue({
        content: [
          { code: 'A', description: 'LDU A' },
          { code: 'B', description: 'LDU B' },
          { code: 'C', description: 'LDU C' },
        ],
      })

      deliusClient.getAllTeamsForLdu.mockResolvedValue({
        content: [
          { code: 'TA', description: 'Team A' },
          { code: 'TB', description: 'Team B' },
        ],
      })

      probationTeamsClient.getLduWithProbationTeams.mockResolvedValue({
        probationAreaCode: 'PA',
        localDeliveryUnitCode: 'B',
        functionalMailbox: 'b@b.com',
        probationTeams: {
          TB: { functionalMailbox: 'b@b.com' },
          TC: { functionalMailbox: 'c@b.com' },
        },
      })

      expect(await functionalMailboxService.getLduWithProbationTeams('PA', 'B')).toEqual({
        description: 'LDU B',
        functionalMailbox: 'b@b.com',
        probationTeams: {
          TA: {
            description: 'Team A',
          },
          TB: {
            description: 'Team B',
            functionalMailbox: 'b@b.com',
          },
          TC: {
            functionalMailbox: 'c@b.com',
          },
        },
      })
    })
  })

  describe('updateLduFunctionalMailbox', () => {
    let probationTeamsClient
    let functionalMailboxService

    beforeEach(() => {
      probationTeamsClient = mockProbationTeamsClient()
      functionalMailboxService = new FunctionalMailboxService(mockDeliusClient(), probationTeamsClient)
    })

    it('Update', async () => {
      await functionalMailboxService.updateLduFunctionalMailbox('PA', 'LDU_A', 'a@b.com')
      expect(probationTeamsClient.setLduFunctionalMailbox).toHaveBeenCalledWith('PA', 'LDU_A', 'a@b.com')
      expect(probationTeamsClient.deleteProbationTeamFunctionalMailbox).not.toHaveBeenCalled()
    })

    it('Delete', async () => {
      await functionalMailboxService.updateLduFunctionalMailbox('PA', 'LDU_A', '')
      expect(probationTeamsClient.deleteLduFunctionalMailbox).toHaveBeenCalledWith('PA', 'LDU_A')
      expect(probationTeamsClient.setLduFunctionalMailbox).not.toHaveBeenCalled()
    })
  })

  describe('updateProbationTeamFunctionalMailbox', () => {
    let probationTeamsClient
    let functionalMailboxService

    beforeEach(() => {
      probationTeamsClient = mockProbationTeamsClient()
      functionalMailboxService = new FunctionalMailboxService(mockDeliusClient(), probationTeamsClient)
    })

    it('Update', async () => {
      await functionalMailboxService.updateProbationTeamFunctionalMailbox('PA', 'LDU_A', 'T_A', 'a@b.com')
      expect(probationTeamsClient.setProbationTeamFunctionalMailbox).toHaveBeenCalledWith(
        'PA',
        'LDU_A',
        'T_A',
        'a@b.com'
      )
      expect(probationTeamsClient.deleteProbationTeamFunctionalMailbox).not.toHaveBeenCalled()
    })

    it('Delete', async () => {
      await functionalMailboxService.updateProbationTeamFunctionalMailbox('PA', 'LDU_A', 'T_A', '')
      expect(probationTeamsClient.deleteProbationTeamFunctionalMailbox).toHaveBeenCalledWith('PA', 'LDU_A', 'T_A')
      expect(probationTeamsClient.setProbationTeamFunctionalMailbox).not.toHaveBeenCalled()
    })
  })
})
