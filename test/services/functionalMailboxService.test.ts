import { FunctionalMailboxService, mergeLduAndTeamData } from '../../server/services/functionalMailboxService'

import { mockProbationTeamsClient, mockDeliusClient } from '../mockClients'
import { LduWithProbationTeams } from '../../types/delius'
import { LdusWithTeamsMap } from '../../types/probationTeams'

describe('FunctionalMailboxService', () => {
  describe('mergeLduData', () => {
    const ldu1: LduWithProbationTeams = {
      code: 'A',
      description: 'Ldu A',
      probationTeams: [],
    }

    const ldu2: LduWithProbationTeams = {
      code: 'B',
      description: 'Ldu B',
      probationTeams: [
        { code: 'TA', description: 'Team A' },
        { code: 'TB', description: 'Team B' },
      ],
    }

    const lduDto1 = Object.freeze({
      probationAreaCode: 'X',
      localDeliveryUnitCode: 'A',
      functionalMailbox: 'a@b.com',
      probationTeams: {},
    })

    const lduDto2 = Object.freeze({
      probationAreaCode: 'X',
      localDeliveryUnitCode: 'B',
      functionalMailbox: null,
      probationTeams: {
        TB: { functionalMailbox: 'tb@b.com' },
        TC: { functionalMailbox: 'tc@b.com' },
      },
    })

    it(' merges empty data sets', () => {
      expect(mergeLduAndTeamData([], {})).toEqual({})
    })

    it(' merges a single LduStatus, no teams', () => {
      expect(mergeLduAndTeamData([ldu1], {})).toEqual({ A: { description: 'Ldu A', probationTeams: {} } })
    })

    it(' merges a single LduDto, no probationTeams', () => {
      expect(mergeLduAndTeamData([], { A: lduDto1 })).toEqual({
        A: { functionalMailbox: 'a@b.com', probationTeams: {} },
      })
    })

    it('merges a matching LduStatus and LduDto', () => {
      expect(mergeLduAndTeamData([ldu1], { A: lduDto1 })).toEqual({
        A: { functionalMailbox: 'a@b.com', description: 'Ldu A', probationTeams: {} },
      })
    })

    it('merges separate LduStatus and LduDto', () => {
      expect(mergeLduAndTeamData([ldu1], { B: lduDto1 })).toEqual({
        A: { description: 'Ldu A', probationTeams: {} },
        B: { functionalMailbox: 'a@b.com', probationTeams: {} },
      })
    })

    it('merges a single lduStatus with teams', () => {
      expect(mergeLduAndTeamData([ldu2], {})).toEqual({
        B: { description: 'Ldu B', probationTeams: { TA: { description: 'Team A' }, TB: { description: 'Team B' } } },
      })
    })

    it('merges a single lduStatus with teams with LduDto with probationTeams (all cases)', () => {
      expect(mergeLduAndTeamData([ldu2], { B: lduDto2 })).toEqual({
        B: {
          description: 'Ldu B',
          functionalMailbox: null,
          probationTeams: {
            TA: { description: 'Team A' },
            TB: { description: 'Team B', functionalMailbox: 'tb@b.com' },
            TC: { functionalMailbox: 'tc@b.com' },
          },
        },
      })
    })
  })

  describe('getLdusAndTeamsForProbationArea', () => {
    let deliusClient
    let probationTeamsClient
    let functionalMailboxService

    beforeEach(() => {
      deliusClient = mockDeliusClient()
      probationTeamsClient = mockProbationTeamsClient()
      functionalMailboxService = new FunctionalMailboxService(deliusClient, probationTeamsClient)
    })

    it('No LDUs or LDU FMBs', async () => {
      deliusClient.getAllLdusForProbationArea.mockResolvedValue({})
      probationTeamsClient.getProbationArea.mockResolvedValue({
        probationAreaCode: 'A',
        localDeliveryUnits: {},
      })

      const lduMap: LdusWithTeamsMap = await functionalMailboxService.getLdusAndTeamsForProbationArea('A')
      expect(lduMap).toEqual({})
    })

    it('Delius has LDUs, but no probation teams. No FMB data', async () => {
      deliusClient.getAllLdusForProbationArea.mockResolvedValue({
        content: [
          { code: 'LA', description: 'LDU A' },
          { code: 'LB', description: 'LDU B' },
        ],
      })

      deliusClient.getAllTeamsForLdu.mockResolvedValue({ content: [] })

      probationTeamsClient.getProbationArea.mockResolvedValue({
        probationAreaCode: 'A',
        localDeliveryUnits: {},
      })

      const lduMap: LdusWithTeamsMap = await functionalMailboxService.getLdusAndTeamsForProbationArea('A')
      expect(lduMap).toEqual({
        LA: {
          description: 'LDU A',
          probationTeams: {},
        },
        LB: {
          description: 'LDU B',
          probationTeams: {},
        },
      })

      expect(deliusClient.getAllTeamsForLdu).toHaveBeenCalledTimes(2)
      expect(deliusClient.getAllTeamsForLdu).toHaveBeenCalledWith('A', 'LA')
      expect(deliusClient.getAllTeamsForLdu).toHaveBeenCalledWith('A', 'LB')
    })
  })
})