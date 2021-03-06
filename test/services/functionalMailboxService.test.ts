import { mocked } from 'ts-jest/utils'
import {
  FunctionalMailboxService,
  mergeLduData,
  mergeProbationAreaData,
  mergeProbationTeams,
} from '../../server/services/functionalMailboxService'

import { AuditMock, mockAudit } from '../mockClients'
import { ProbationTeamsClient } from '../../server/data/probationTeamsClient'
import { DeliusClient } from '../../server/data/deliusClient'
import type { ProbationArea } from '../../server/data/deliusClient'

jest.mock('../../server/data/deliusClient')
jest.mock('../../server/data/probationTeamsClient')

const mockDeliusClient = mocked(DeliusClient, true)

const BASE_PROBATION_AREA: ProbationArea = Object.freeze({
  code: '',
  description: '',
  probationAreaId: 1,
  nps: false,
  institution: Object.freeze({
    institutionId: 1,
    isEstablishment: false,
    code: 'I1',
    description: 'I1',
    institutionName: 'I1',
    establishmentType: { code: 'I1', description: 'I1' },
    isPrivate: false,
  }),
  organisation: { code: 'org', description: 'org' },
  teams: [],
})

describe('FunctionalMailboxService', () => {
  beforeEach(() => {
    mockDeliusClient.mockClear()
  })

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
            D: {
              probationAreaCode: 'PA',
              localDeliveryUnitCode: 'D',
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
    it('merges empty data sets', () => {
      expect(mergeProbationAreaData([], [])).toEqual({})
    })

    it('merges overlapping data sets', () => {
      expect(
        mergeProbationAreaData(
          [
            {
              ...BASE_PROBATION_AREA,
              code: 'A',
              description: 'PA A',
              probationAreaId: 1,
            },
            {
              ...BASE_PROBATION_AREA,
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

  describe('mergeProbationTeams', () => {
    it('handles missing data', () => {
      expect(mergeProbationTeams([], undefined)).toEqual({})
    })
  })

  describe('service methods', () => {
    let deliusClient: DeliusClient
    let probationTeamsClient: ProbationTeamsClient
    let functionalMailboxService: FunctionalMailboxService
    let audit: AuditMock

    const initMocks = () => {
      deliusClient = new DeliusClient(undefined)
      probationTeamsClient = new ProbationTeamsClient(undefined)
      audit = mockAudit()
      functionalMailboxService = new FunctionalMailboxService(deliusClient, probationTeamsClient, audit)
    }

    describe('getAllProbationAreas', () => {
      beforeEach(initMocks)

      it('Happy path', async () => {
        mocked(deliusClient).getAllProbationAreas.mockResolvedValue({
          content: [
            { ...BASE_PROBATION_AREA, code: 'A', description: 'PA A' },
            { ...BASE_PROBATION_AREA, code: 'B', description: 'PA B' },
          ],
        })
        mocked(probationTeamsClient).getProbationAreaCodes.mockResolvedValue(['B', 'C'])

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
        mocked(deliusClient).getAllProbationAreas.mockResolvedValue(undefined)
        mocked(probationTeamsClient).getProbationAreaCodes.mockResolvedValue(undefined)

        expect(await functionalMailboxService.getAllProbationAreas()).toEqual({})
      })
    })

    describe('getLdusForProbationArea', () => {
      beforeEach(initMocks)

      it('Happy path', async () => {
        mocked(deliusClient).getAllLdusForProbationArea.mockResolvedValue({
          content: [{ code: 'B', description: 'LDU B' }],
        })
        mocked(probationTeamsClient).getProbationArea.mockResolvedValue({
          probationAreaCode: 'PA',
          localDeliveryUnits: {
            B: {
              probationAreaCode: 'PA',
              localDeliveryUnitCode: 'B',
              functionalMailbox: 'b@b.com',
              probationTeams: {},
            },
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
        mocked(deliusClient).getAllLdusForProbationArea.mockResolvedValue({ content: [] })
        mocked(probationTeamsClient).getProbationArea.mockResolvedValue(undefined)

        expect(await functionalMailboxService.getLdusForProbationArea('PA')).toEqual({})
      })
    })

    describe('getLduWithTeams', () => {
      beforeEach(initMocks)

      it('Happy path', async () => {
        mocked(deliusClient).getAllLdusForProbationArea.mockResolvedValue({
          content: [
            { code: 'A', description: 'LDU A' },
            { code: 'B', description: 'LDU B' },
            { code: 'C', description: 'LDU C' },
          ],
        })

        mocked(deliusClient).getAllTeamsForLdu.mockResolvedValue({
          content: [
            { code: 'TA', description: 'Team A' },
            { code: 'TB', description: 'Team B' },
          ],
        })

        mocked(probationTeamsClient).getLduWithProbationTeams.mockResolvedValue({
          probationAreaCode: 'PA',
          localDeliveryUnitCode: 'B',
          functionalMailbox: 'b@b.com',
          probationTeams: {
            TB: { functionalMailbox: 'b@b.com' },
            TC: { functionalMailbox: 'c@b.com' },
          },
        })

        expect(
          await functionalMailboxService.getLduWithProbationTeams({
            probationAreaCode: 'PA',
            lduCode: 'B',
          })
        ).toEqual({
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

      it('No data', async () => {
        mocked(deliusClient).getAllLdusForProbationArea.mockResolvedValue({ content: [] })
        mocked(deliusClient).getAllTeamsForLdu.mockResolvedValue({ content: [] })
        mocked(probationTeamsClient).getLduWithProbationTeams.mockResolvedValue(undefined)

        expect(
          await functionalMailboxService.getLduWithProbationTeams({
            probationAreaCode: 'PA',
            lduCode: 'B',
          })
        ).toEqual({
          description: '',
          functionalMailbox: '',
          probationTeams: {},
        })
      })

      it('Not found', async () => {
        mocked(deliusClient).getAllLdusForProbationArea.mockResolvedValue({ content: [] })
        mocked(deliusClient).getAllTeamsForLdu.mockResolvedValue({ content: [] })
        mocked(probationTeamsClient).getLduWithProbationTeams.mockResolvedValue(undefined)

        expect(
          await functionalMailboxService.getLduWithProbationTeams({
            probationAreaCode: 'PA',
            lduCode: 'B',
          })
        ).toEqual({
          description: '',
          functionalMailbox: '',
          probationTeams: {},
        })
      })
    })

    describe('updateLduFunctionalMailbox', () => {
      beforeEach(initMocks)

      it('Update', async () => {
        const identifier = { probationAreaCode: 'PA', lduCode: 'LDU_A' }
        await functionalMailboxService.updateLduFunctionalMailbox('user', identifier, 'a@b.com')
        expect(probationTeamsClient.setLduFunctionalMailbox).toHaveBeenCalledWith(identifier, 'a@b.com')
        expect(probationTeamsClient.deleteProbationTeamFunctionalMailbox).not.toHaveBeenCalled()
        expect(audit.record).toHaveBeenCalledWith('FUNCTIONAL_MAILBOX', 'user', {
          functionalMailbox: 'a@b.com',
          identifier: {
            lduCode: 'LDU_A',
            probationAreaCode: 'PA',
          },
          operation: 'UPDATE',
        })
      })

      it('Delete', async () => {
        const identifier = { probationAreaCode: 'PA', lduCode: 'LDU_A' }
        await functionalMailboxService.updateLduFunctionalMailbox('user', identifier, '')
        expect(probationTeamsClient.deleteLduFunctionalMailbox).toHaveBeenCalledWith(identifier)
        expect(probationTeamsClient.setLduFunctionalMailbox).not.toHaveBeenCalled()
        expect(audit.record).toHaveBeenCalledWith('FUNCTIONAL_MAILBOX', 'user', {
          identifier: {
            lduCode: 'LDU_A',
            probationAreaCode: 'PA',
          },
          operation: 'DELETE',
        })
      })
    })

    describe('updateProbationTeamFunctionalMailbox', () => {
      beforeEach(initMocks)

      it('Update', async () => {
        const indentifier = { probationAreaCode: 'PA', lduCode: 'LDU_A', teamCode: 'T_A' }
        await functionalMailboxService.updateProbationTeamFunctionalMailbox('user', indentifier, 'a@b.com')
        expect(probationTeamsClient.setProbationTeamFunctionalMailbox).toHaveBeenCalledWith(indentifier, 'a@b.com')
        expect(probationTeamsClient.deleteProbationTeamFunctionalMailbox).not.toHaveBeenCalled()
        expect(audit.record).toHaveBeenCalledWith('FUNCTIONAL_MAILBOX', 'user', {
          functionalMailbox: 'a@b.com',
          identifier: {
            lduCode: 'LDU_A',
            probationAreaCode: 'PA',
            teamCode: 'T_A',
          },
          operation: 'UPDATE',
        })
      })

      it('Delete', async () => {
        const identifier = { probationAreaCode: 'PA', lduCode: 'LDU_A', teamCode: 'T_A' }
        await functionalMailboxService.updateProbationTeamFunctionalMailbox('user', identifier, '')
        expect(probationTeamsClient.deleteProbationTeamFunctionalMailbox).toHaveBeenCalledWith(identifier)
        expect(probationTeamsClient.setProbationTeamFunctionalMailbox).not.toHaveBeenCalled()
        expect(audit.record).toHaveBeenCalledWith('FUNCTIONAL_MAILBOX', 'user', {
          identifier: {
            lduCode: 'LDU_A',
            probationAreaCode: 'PA',
            teamCode: 'T_A',
          },
          operation: 'DELETE',
        })
      })
    })
  })
})
