import * as R from 'ramda'
import {
  LduMap,
  LdusWithTeamsMap,
  LduWithTeams,
  LocalDeliveryUnitDto,
  ProbationTeamsClient,
} from '../../types/probationTeams'
import { DeliusClient, Ldu, LduWithProbationTeams, ProbationTeam } from '../../types/delius'

export const mergeLduAndTeamData = (
  ldus: LduWithProbationTeams[],
  lduDtos: {
    [localDeliveryUnitCode: string]: LocalDeliveryUnitDto
  }
): LdusWithTeamsMap => {
  const lduMap = R.pipe(
    R.indexBy(R.prop('code')),
    R.map((ldu) => ({
      description: ldu.description,
      probationTeams: R.pipe(R.indexBy(R.prop('code')), R.map(R.pick(['description'])))(ldu.probationTeams),
    }))
  )(ldus)

  const filteredDtos = R.map(R.pick(['functionalMailbox', 'probationTeams']), lduDtos)

  return R.mergeDeepRight(lduMap, filteredDtos)
}

export const mergeLduData = (
  ldus: Ldu[],
  lduDtos: {
    [localDeliveryUnitCode: string]: LocalDeliveryUnitDto
  }
): LduMap => {
  const lduMap = R.pipe(
    R.indexBy(R.prop('code')),
    R.map((ldu) => ({ description: ldu.description }))
  )(ldus)

  const filteredDtos = R.map(R.pick(['functionalMailbox']), lduDtos)

  return R.mergeRight(lduMap, filteredDtos)
}

function getDescription(ldus: any[], lduCode: string) {
  return R.pathOr(
    '',
    [0, 'description'],
    ldus.filter((ldu) => ldu.code === lduCode)
  )
}

function mergeProbationTeams(probationTeams: ProbationTeam[], localDeliveryUnitDto: LocalDeliveryUnitDto) {
  return R.pipe(
    R.indexBy(R.prop('code')),
    R.map(R.pick(['description'])),
    R.mergeDeepRight(R.propOr({}, 'probationTeams', localDeliveryUnitDto))
  )(probationTeams)
}

export class FunctionalMailboxService {
  constructor(
    private readonly deliusClient: DeliusClient,
    private readonly probationTeamsClient: ProbationTeamsClient
  ) {}

  getAllProbationAreas = async () => (await this.deliusClient.getAllProbationAreas()).content

  private addProbationTeamsToLdu = async (probationAreaCode: string, ldu: Ldu): Promise<LduWithProbationTeams> => {
    const { content: probationTeams = [] } = await this.deliusClient.getAllTeamsForLdu(probationAreaCode, ldu.code)
    return {
      ...ldu,
      probationTeams,
    }
  }

  getLdusAndTeamsForProbationArea = async (probationAreaCode): Promise<LdusWithTeamsMap> => {
    const [{ content: ldus = [] }, { localDeliveryUnits }] = await Promise.all([
      this.deliusClient.getAllLdusForProbationArea(probationAreaCode),
      this.probationTeamsClient.getProbationArea(probationAreaCode),
    ])

    const ldusWithTeams = await Promise.all(ldus.map((ldu) => this.addProbationTeamsToLdu(probationAreaCode, ldu)))
    return mergeLduAndTeamData(ldusWithTeams, localDeliveryUnits)
  }

  getLdusForProbationArea = async (probationAreaCode): Promise<LduMap> => {
    const [{ content: ldus = [] }, { localDeliveryUnits }] = await Promise.all([
      this.deliusClient.getAllLdusForProbationArea(probationAreaCode),
      this.probationTeamsClient.getProbationArea(probationAreaCode),
    ])

    return mergeLduData(ldus, localDeliveryUnits)
  }

  getLduWithTeams = async (probationAreaCode: string, lduCode: string): Promise<LduWithTeams> => {
    const [{ content: ldus = [] }, { content: probationTeams = [] }, localDeliveryUnitDto] = await Promise.all([
      this.deliusClient.getAllLdusForProbationArea(probationAreaCode),
      this.deliusClient.getAllTeamsForLdu(probationAreaCode, lduCode),
      this.probationTeamsClient.getLduWithProbationTeams(probationAreaCode, lduCode),
    ])

    return {
      description: getDescription(ldus, lduCode),
      functionalMailbox: R.propOr('', 'functionalMailbox', localDeliveryUnitDto),
      probationTeams: mergeProbationTeams(probationTeams, localDeliveryUnitDto),
    }
  }
}
