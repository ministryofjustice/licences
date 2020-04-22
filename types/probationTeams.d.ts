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

export interface ProbationTeamsClient {
  getFunctionalMailbox: (probationAreaCode: string, lduCode: string, teamCode: string) => Promise<string>

  getProbationArea: (probationAreaCode: string) => Promise<ProbationAreaDto>

  setLduFunctionalMailbox: (
    token: string,
    probationAreaCode: string,
    localDeliveryUnitCode: string,
    proposedFunctionalMailbox: string
  ) => Promise<Void>

  deleteLduFunctionalMailbox: (token: string, probationAreaCode: string, localDeliveryUnitCode: string) => Promise<Void>

  setProbationTeamFunctionalMailbox: (
    token: string,
    probationAreaCode: string,
    localDeliveryUnitCode: string,
    teamCode: string,
    proposedFunctionalMailbox: string
  ) => Promise<Void>

  deleteProbationTeamFunctionalMailbox: (
    token: string,
    probationAreaCode: string,
    localDeliveryUnitCode: string,
    teamCode: string
  ) => Promise<Void>
}
