import { ProbationAreaSummary } from './delius'

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

  getLduWithProbationTeams: (probationAreaCode, lduCode) => Promise<LocalDeliveryUnitDto>

  setLduFunctionalMailbox: (
    probationAreaCode: string,
    localDeliveryUnitCode: string,
    proposedFunctionalMailbox: string
  ) => Promise<Void>

  deleteLduFunctionalMailbox: (probationAreaCode: string, localDeliveryUnitCode: string) => Promise<Void>

  setProbationTeamFunctionalMailbox: (
    probationAreaCode: string,
    localDeliveryUnitCode: string,
    teamCode: string,
    proposedFunctionalMailbox: string
  ) => Promise<Void>

  deleteProbationTeamFunctionalMailbox: (
    probationAreaCode: string,
    localDeliveryUnitCode: string,
    teamCode: string
  ) => Promise<Void>
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

export interface FunctionalMailboxService {
  getAllProbationAreas: () => Promise<ProbationAreaSummary[]>
  getLdusForProbationArea: (probationAreaCode: string) => Promise<LduMap>
  getLduWithTeams: (probationAreaCode: string, lduCode: string) => Promise<LduWithTeams>
  updateLduFunctionalMailbox: (probationAreaCode: string, lduCode: string, functionalMailbox: string) => Promise<void>
  updateProbationTeamFunctionalMailbox: (
    probationAreaCode: string,
    lduCode: string,
    teamCode: string,
    functionalMailbox: string
  ) => Promise<void>
}
