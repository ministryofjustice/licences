import R from 'ramda'
import logger from '../../log'

export interface ProbationTeamDto {
  functionalMailbox?: string
}

export interface LocalDeliveryUnitDto {
  probationAreaCode: string
  localDeliveryUnitCode: string
  functionalMailbox?: string
  probationTeams: {
    [probationTeamCode: string]: ProbationTeamDto
  }
}

export interface ProbationAreaDto {
  probationAreaCode: string
  localDeliveryUnits: {
    [localDeliveryUnitCode: string]: LocalDeliveryUnitDto
  }
}

export interface LduIdentifier {
  probationAreaCode: string
  lduCode: string
}

export interface ProbationTeamIdentifier extends LduIdentifier {
  probationAreaCode: string
  lduCode: string
  teamCode: string
}

export class ProbationTeamsClient {
  constructor(readonly restClient) {}

  async getFunctionalMailbox({ probationAreaCode, lduCode, teamCode }: ProbationTeamIdentifier): Promise<string> {
    const ldu = await this.getLduWithProbationTeams({ probationAreaCode, lduCode })
    const teamAddress = R.path(['probationTeams', teamCode, 'functionalMailbox'], ldu)
    const functionalMailbox = teamAddress || (ldu && ldu.functionalMailbox)
    if (!functionalMailbox) {
      logger.info(
        `Could not find functional mailbox for the probation area code ${probationAreaCode} having an ldu code: ${lduCode} or team code: ${teamCode}`
      )
    }
    return functionalMailbox
  }

  async getProbationAreaCodes(): Promise<Array<string>> {
    return this.restClient.getResource(`/probation-area-codes`)
  }

  async getLduWithProbationTeams({ probationAreaCode, lduCode }: LduIdentifier): Promise<LocalDeliveryUnitDto> {
    return this.restClient.getResource(`/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}`)
  }

  async getProbationArea(probationAreaCode: string): Promise<ProbationAreaDto> {
    return this.restClient.getResource(`/probation-areas/${probationAreaCode}`)
  }

  async deleteLduFunctionalMailbox({ probationAreaCode, lduCode }: LduIdentifier): Promise<void> {
    await this.restClient.deleteResource(
      `/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}/functional-mailbox`
    )
  }

  async setLduFunctionalMailbox({ probationAreaCode, lduCode }, proposedFunctionalMailbox): Promise<void> {
    await this.restClient.putResource(
      `/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}/functional-mailbox`,
      `"${proposedFunctionalMailbox}"`
    )
  }

  async deleteProbationTeamFunctionalMailbox({
    probationAreaCode,
    lduCode,
    teamCode,
  }: ProbationTeamIdentifier): Promise<void> {
    await this.restClient.deleteResource(
      `/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}/teams/${teamCode}/functional-mailbox`
    )
  }

  async setProbationTeamFunctionalMailbox(
    { probationAreaCode, lduCode, teamCode }: ProbationTeamIdentifier,
    proposedFunctionalMailbox: string
  ): Promise<void> {
    await this.restClient.putResource(
      `/probation-areas/${probationAreaCode}/local-delivery-units/${lduCode}/teams/${teamCode}/functional-mailbox`,
      `"${proposedFunctionalMailbox}"`
    )
  }
}
