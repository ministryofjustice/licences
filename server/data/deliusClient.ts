import config from '../config'

export interface KeyValue {
  code: string
  description: string
}

export interface Human {
  forenames: string
  surname: string
}

export interface Team {
  code: string
  description: string
  telephone: string
  localDeliveryUnit: KeyValue
  district: KeyValue
  borough: KeyValue
}

export interface StaffDetails {
  username?: string
  email?: string
  staffCode: string
  staffIdentifier: number
  staff: Human
  teams: Team[]
}

interface Institution {
  institutionId: number
  isEstablishment: boolean
  code: string
  description: string
  institutionName: string
  establishmentType: KeyValue
  isPrivate: boolean
}

interface AllTeam {
  providerTeamId: number
  teamId: number
  code: string
  description: string
  name: string
  isPrivate: boolean
  externalProvider: KeyValue
  scProvider: KeyValue
  localDeliveryUnit: KeyValue
  district: KeyValue
  borough: KeyValue
}

export interface ProbationArea {
  probationAreaId: number
  code: string
  description: string
  nps: boolean
  organisation: KeyValue
  institution: Institution
  teams: AllTeam[]
}

export interface CommunityOrPrisonOffenderManager {
  staffCode: string
  staffId: number
  isResponsibleOfficer: boolean
  isPrisonOffenderManager: boolean
  isUnallocated: boolean
  staff: Human
  team: Team
  probationArea: ProbationArea
  fromDate: Date
}

export interface ProbationAreaSummary {
  code: string
  description: string
}

export interface Ldu {
  code: string
  description: string
}

export interface ProbationTeam {
  code: string
  description: string
}

export interface ManagedOffender {
  staffCode: string
  staffIdentifier: number
  offenderId: number
  nomsNumber: string
  crnNumber: string
  offenderSurname: string
  isCurrentRo: boolean
  isCurrentOm: boolean
  isCurrentPom: boolean
  omStartDate: Date
  omEndDate: Date
}

export interface Page<T> {
  content?: T[]
}

export class DeliusClient {
  constructor(readonly restClient) {}

  getStaffDetailsByStaffCode(staffCode): Promise<any> {
    return this.restClient.getResource(`/staff/staffCode/${staffCode}`)
  }

  getStaffDetailsByStaffIdentifier(staffIdentifier: number): Promise<StaffDetails> {
    return this.restClient.getResource(`/staff/staffIdentifier/${staffIdentifier}`)
  }

  getStaffDetailsByUsername(username: string): Promise<StaffDetails> {
    return this.restClient.getResource(`/staff/username/${username}`)
  }

  getROPrisonersByStaffIdentifier(staffIdentifier: number): Promise<Array<ManagedOffender>> {
    return this.restClient.getResource(`/staff/staffIdentifier/${staffIdentifier}/managedOffenders`)
  }

  getAllOffenderManagers(offenderNo: string): Promise<Array<CommunityOrPrisonOffenderManager>> {
    return this.restClient.getResource(`/offenders/nomsNumber/${offenderNo}/allOffenderManagers`)
  }

  getAllProbationAreas(): Promise<Page<ProbationArea>> {
    return this.restClient.getResource(`/probationAreas?excludeEstablishments=true&active=true`)
  }

  async getAllLdusForProbationArea(probationAreaCode: string): Promise<Page<Ldu>> {
    const ldus = await this.restClient.getResource(`/probationAreas/code/${probationAreaCode}/localDeliveryUnits`)
    return ldus?.content ? ldus : { content: [] }
  }

  async getAllTeamsForLdu(probationAreaCode: string, lduCode: string): Promise<Page<ProbationTeam>> {
    const teams = await this.restClient.getResource(
      `/probationAreas/code/${probationAreaCode}/localDeliveryUnits/code/${lduCode}/teams`
    )
    return teams?.content ? teams : { content: [] }
  }

  async addResponsibleOfficerRole(username: string): Promise<void> {
    await this.addRole(username, config.delius.responsibleOfficerRoleId)
  }

  async addRole(username: string, code: string): Promise<void> {
    try {
      await this.restClient.putResource(`/users/${username}/roles/${code}`, '')
    } catch (error) {
      // Do nothing
    }
  }

  async getUser(username: string): Promise<any> {
    return this.restClient.getResource(`/users/${username}/details`)
  }
}
