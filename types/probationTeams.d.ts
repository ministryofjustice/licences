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

export interface LduIdentifer {
  probationAreaCode: string
  lduCode: string
}
export interface ProbationTeamIdentifier extends LduIdentifier {
  probationAreaCode: string
  lduCode: string
  teamCode: string
}
export interface ProbationTeamsClient {
  getFunctionalMailbox: (probationTeamIdentifier: ProbationTeamIdentifier) => Promise<string>

  getProbationAreaCodes: () => Promise<Array<string>>

  getProbationArea: (probationAreaCode: string) => Promise<ProbationAreaDto>

  getLduWithProbationTeams: (lduIdentifier: LduIdentifer) => Promise<LocalDeliveryUnitDto>

  setLduFunctionalMailbox: (lduIdentifer: LduIdentifer, proposedFunctionalMailbox: string) => Promise<Void>

  deleteLduFunctionalMailbox: (lduIdentifer: LduIdentifer) => Promise<Void>

  setProbationTeamFunctionalMailbox: (
    probationTeamIdentifier: ProbationTeamIdentifier,
    proposedFunctionalMailbox: string
  ) => Promise<Void>

  deleteProbationTeamFunctionalMailbox: (probationTeamIdentifier: ProbationTeamIdentifier) => Promise<Void>
}

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
