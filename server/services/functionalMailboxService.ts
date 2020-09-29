import * as R from 'ramda'

import {
  LocalDeliveryUnitDto,
  ProbationTeamsClient,
  LduIdentifier,
  ProbationTeamIdentifier,
} from '../data/probationTeamsClient'
import { DeliusClient, Ldu, ProbationArea, ProbationTeam } from '../data/deliusClient'

export interface LduMap {
  [code: string]: {
    description?: string
    functionalMailbox?: string
  }
}

export interface LdusWithTeamsMap {
  [code: string]: LduWithTeams
}

export interface LduWithTeams {
  description?: string
  functionalMailbox?: string
  probationTeams: ProbationTeamMap
}

export interface ProbationTeamMap {
  [code: string]: {
    description?: string
    functionalMailbox?: string
  }
}

export const mergeLduData = (
  ldus: Ldu[],
  lduDtos: { [localDeliveryUnitCode: string]: LocalDeliveryUnitDto }
): LduMap => {
  const lduMap = ldus.reduce((map, { code, description }) => ({ ...map, [code]: { description } }), {})
  const filteredDtos = Object.entries(lduDtos).reduce(
    (map, [code, { functionalMailbox }]) => (functionalMailbox ? { ...map, [code]: { functionalMailbox } } : map),
    {}
  )
  return R.mergeDeepRight(lduMap, filteredDtos)
}

export const mergeProbationTeams = (probationTeams: ProbationTeam[], localDeliveryUnitDto: LocalDeliveryUnitDto) => {
  const probationTeamMap = probationTeams.reduce(
    (map, { code, description }) => ({ ...map, [code]: { description } }),
    {}
  )
  const probationTeamDtoMap = R.propOr({}, 'probationTeams', localDeliveryUnitDto)
  return R.mergeDeepRight(probationTeamMap, probationTeamDtoMap)
}

export function mergeProbationAreaData(probationAreas: ProbationArea[], probationAreaCodes: string[]) {
  const probationCodeMap = probationAreaCodes.reduce((map, code) => ({ ...map, [code]: {} }), {})
  const probationAreaMap = probationAreas.reduce(
    (map, { code, description }) => ({ ...map, [code]: { description } }),
    {}
  )
  return R.mergeDeepRight(probationAreaMap, probationCodeMap)
}

function getDescription(ldus: any[], lduCode: string) {
  return R.pathOr(
    '',
    [0, 'description'],
    ldus.filter((ldu) => ldu.code === lduCode)
  )
}

export class FunctionalMailboxService {
  constructor(
    private readonly deliusClient: DeliusClient,
    private readonly probationTeamsClient: ProbationTeamsClient,
    private readonly audit
  ) {}

  getAllProbationAreas = async () => {
    const [{ content: probationAreas } = { content: [] }, probationAreaCodes = []] = await Promise.all([
      this.deliusClient.getAllProbationAreas(),
      this.probationTeamsClient.getProbationAreaCodes(),
    ])
    return mergeProbationAreaData(probationAreas, probationAreaCodes)
  }

  getLdusForProbationArea = async (probationAreaCode): Promise<LduMap> => {
    const [{ content: ldus }, { localDeliveryUnits = {} } = {}] = await Promise.all([
      this.deliusClient.getAllLdusForProbationArea(probationAreaCode),
      this.probationTeamsClient.getProbationArea(probationAreaCode),
    ])

    return mergeLduData(ldus, localDeliveryUnits)
  }

  getLduWithProbationTeams = async ({ probationAreaCode, lduCode }): Promise<LduWithTeams> => {
    const [{ content: ldus }, { content: probationTeams }, localDeliveryUnitDto] = await Promise.all([
      this.deliusClient.getAllLdusForProbationArea(probationAreaCode),
      this.deliusClient.getAllTeamsForLdu(probationAreaCode, lduCode),
      this.probationTeamsClient.getLduWithProbationTeams({ probationAreaCode, lduCode }),
    ])

    return {
      description: getDescription(ldus, lduCode),
      functionalMailbox: R.propOr('', 'functionalMailbox', localDeliveryUnitDto),
      probationTeams: mergeProbationTeams(probationTeams, localDeliveryUnitDto),
    }
  }

  updateLduFunctionalMailbox = async (userName: string, identifier: LduIdentifier, functionalMailbox: string) => {
    if (functionalMailbox) {
      await this.probationTeamsClient.setLduFunctionalMailbox(identifier, functionalMailbox)
      await this.auditUpdateLduFmb(userName, identifier, functionalMailbox)
    } else {
      await this.probationTeamsClient.deleteLduFunctionalMailbox(identifier)
      await this.auditDeleteLduFmb(userName, identifier)
    }
  }

  updateProbationTeamFunctionalMailbox = async (
    userName: string,
    identifier: ProbationTeamIdentifier,
    functionalMailbox: string
  ) => {
    if (functionalMailbox) {
      await this.probationTeamsClient.setProbationTeamFunctionalMailbox(identifier, functionalMailbox)
      await this.auditUpdateTeamFmb(userName, identifier, functionalMailbox)
    } else {
      await this.probationTeamsClient.deleteProbationTeamFunctionalMailbox(identifier)
      await this.auditDeleteTeamFmb(userName, identifier)
    }
  }

  private auditUpdateLduFmb = (user: string, identifier: LduIdentifier, functionalMailbox: string) =>
    this.audit.record('FUNCTIONAL_MAILBOX', user, { operation: 'UPDATE', identifier, functionalMailbox })

  private auditDeleteLduFmb = (user: string, identifier: LduIdentifier) =>
    this.audit.record('FUNCTIONAL_MAILBOX', user, { operation: 'DELETE', identifier })

  private auditUpdateTeamFmb = async (user: string, identifier: ProbationTeamIdentifier, functionalMailbox: string) =>
    this.audit.record('FUNCTIONAL_MAILBOX', user, { operation: 'UPDATE', identifier, functionalMailbox })

  private auditDeleteTeamFmb = (user: string, identifier: ProbationTeamIdentifier) =>
    this.audit.record('FUNCTIONAL_MAILBOX', user, { operation: 'DELETE', identifier })
}
