import * as R from 'ramda'
import {
  LduIdentifer,
  LduMap,
  LduWithTeams,
  LocalDeliveryUnitDto,
  ProbationTeamIdentifier,
  ProbationTeamsClient,
} from '../../types/probationTeams'
import { DeliusClient, Ldu, ProbationArea, ProbationTeam } from '../../types/delius'

export const mergeLduData = (
  ldus: Ldu[],
  lduDtos: {
    [localDeliveryUnitCode: string]: LocalDeliveryUnitDto
  }
): LduMap => {
  const lduMap = R.pipe(R.indexBy(R.prop('code')), R.map(R.pick(['description'])))(ldus)
  const filteredDtos = R.map(R.pick(['functionalMailbox']), lduDtos)
  return R.mergeDeepRight(lduMap, filteredDtos)
}

function mergeProbationTeams(probationTeams: ProbationTeam[], localDeliveryUnitDto: LocalDeliveryUnitDto) {
  const probationTeamMap = R.pipe(R.indexBy(R.prop('code')), R.map(R.pick(['description'])))(probationTeams)
  const probationTeamDtoMap = localDeliveryUnitDto.probationTeams || {}
  return R.mergeDeepRight(probationTeamMap, probationTeamDtoMap)
}

export function mergeProbationAreaData(probationAreas: ProbationArea[], probationAreaCodes: string[]) {
  const probationCodeMap = probationAreaCodes.reduce((map, code) => ({ ...map, [code]: {} }), {})
  const probationAreaMap = R.pipe(R.indexBy(R.prop('code')), R.map(R.pick(['description'])))(probationAreas)
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
    const [{ content: probationAreas = [] } = {}, probationAreaCodes = []] = await Promise.all([
      this.deliusClient.getAllProbationAreas(),
      this.probationTeamsClient.getProbationAreaCodes(),
    ])
    return mergeProbationAreaData(probationAreas, probationAreaCodes)
  }

  getLdusForProbationArea = async (probationAreaCode): Promise<LduMap> => {
    const [{ content: ldus = [] } = {}, { localDeliveryUnits = {} } = {}] = await Promise.all([
      this.deliusClient.getAllLdusForProbationArea(probationAreaCode),
      this.probationTeamsClient.getProbationArea(probationAreaCode),
    ])

    return mergeLduData(ldus, localDeliveryUnits)
  }

  getLduWithProbationTeams = async ({ probationAreaCode, lduCode }): Promise<LduWithTeams> => {
    const [
      { content: ldus = [] } = {},
      { content: probationTeams = [] } = {},
      localDeliveryUnitDto,
    ] = await Promise.all([
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

  updateLduFunctionalMailbox = async (user: string, identifier: LduIdentifer, functionalMailbox: string) => {
    if (functionalMailbox) {
      await this.probationTeamsClient.setLduFunctionalMailbox(identifier, functionalMailbox)
      await this.auditUpdateLduFmb(user, identifier, functionalMailbox)
    } else {
      await this.probationTeamsClient.deleteLduFunctionalMailbox(identifier)
      await this.auditDeleteLduFmb(user, identifier)
    }
  }

  updateProbationTeamFunctionalMailbox = async (
    user: string,
    identifier: ProbationTeamIdentifier,
    functionalMailbox: string
  ) => {
    if (functionalMailbox) {
      await this.probationTeamsClient.setProbationTeamFunctionalMailbox(identifier, functionalMailbox)
      await this.auditUpdateTeamFmb(user, identifier, functionalMailbox)
    } else {
      await this.probationTeamsClient.deleteProbationTeamFunctionalMailbox(identifier)
      await this.auditDeleteTeamFmb(user, identifier)
    }
  }

  private auditUpdateLduFmb = (user: string, identifier: LduIdentifer, functionalMailbox: string) =>
    this.audit.record('FUNCTIONAL_MAILBOX', user, { operation: 'UPDATE', identifier, functionalMailbox })

  private auditDeleteLduFmb = (user: string, identifier: LduIdentifer) =>
    this.audit.record('FUNCTIONAL_MAILBOX', user, { operation: 'DELETE', identifier })

  private auditUpdateTeamFmb = async (user: string, identifier: ProbationTeamIdentifier, functionalMailbox: string) =>
    this.audit.record('FUNCTIONAL_MAILBOX', user, { operation: 'UPDATE', identifier, functionalMailbox })

  private auditDeleteTeamFmb = (user: string, identifier: ProbationTeamIdentifier) =>
    this.audit.record('FUNCTIONAL_MAILBOX', user, { operation: 'DELETE', identifier })
}
