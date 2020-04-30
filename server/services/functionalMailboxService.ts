import * as R from 'ramda'
import { LduMap, LduWithTeams, LocalDeliveryUnitDto, ProbationTeamsClient } from '../../types/probationTeams'
import { DeliusClient, Ldu, ProbationTeam } from '../../types/delius'

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

  return R.mergeDeepRight(lduMap, filteredDtos)
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

  getLdusForProbationArea = async (probationAreaCode): Promise<LduMap> => {
    const [{ content: ldus = [] } = {}, { localDeliveryUnits = {} } = {}] = await Promise.all([
      this.deliusClient.getAllLdusForProbationArea(probationAreaCode),
      this.probationTeamsClient.getProbationArea(probationAreaCode),
    ])

    return mergeLduData(ldus, localDeliveryUnits)
  }

  getLduWithProbationTeams = async (probationAreaCode: string, lduCode: string): Promise<LduWithTeams> => {
    const [
      { content: ldus = [] } = {},
      { content: probationTeams = [] } = {},
      localDeliveryUnitDto,
    ] = await Promise.all([
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

  updateLduFunctionalMailbox = async (probationAreaCode: string, lduCode: string, functionalMailbox: string) => {
    if (functionalMailbox) {
      await this.probationTeamsClient.setLduFunctionalMailbox(probationAreaCode, lduCode, functionalMailbox)
    } else {
      await this.probationTeamsClient.deleteLduFunctionalMailbox(probationAreaCode, lduCode)
    }
  }

  updateProbationTeamFunctionalMailbox = async (
    probationAreaCode: string,
    lduCode: string,
    teamCode: string,
    functionalMailbox: string
  ) => {
    if (functionalMailbox) {
      await this.probationTeamsClient.setProbationTeamFunctionalMailbox(
        probationAreaCode,
        lduCode,
        teamCode,
        functionalMailbox
      )
    } else {
      await this.probationTeamsClient.deleteProbationTeamFunctionalMailbox(probationAreaCode, lduCode, teamCode)
    }
  }
}
