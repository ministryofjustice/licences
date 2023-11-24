import config from '../config'

export interface DeliusUser {
  username: string
  enabled: boolean
  roles: string[]
}

export interface LocalAdminUnit {
  description: string
  teams: KeyValue[]
}

export interface ProviderWithLaus {
  code: string
  description: string
  localAdminUnits: KeyValue[]
}

export interface CommunityManager {
  code: string
  /** @deprecated use code instead */
  staffId: number
  name: Name
  team: KeyValue
  provider: KeyValue
  localAdminUnit: KeyValue
  isUnallocated: boolean
}

export interface KeyValue {
  code: string
  description: string
}

export interface Name {
  forenames: string
  surname: string
}

export interface Team {
  code: string
  description: string
  telephone: string
  probationDeliveryUnit: KeyValue
  localAdminUnit: KeyValue
}

export interface StaffDetails {
  code: string
  /** @deprecated use code instead */
  staffId: number
  name: Name
  teams: Team[]
  username?: string
  email?: string
}

export class DeliusClient {
  constructor(readonly restClient) {}

  getStaffDetailsByStaffCode(staffCode: string): Promise<StaffDetails> {
    return this.restClient.getResource(`/staff/${staffCode}`)
  }

  /** @deprecated use getStaffDetailsByStaffCode instead */
  getStaffDetailsByStaffIdentifier(staffIdentifier: number): Promise<StaffDetails> {
    return this.restClient.getResource(`/staff?id=${staffIdentifier}`)
  }

  getStaffDetailsByUsername(username: string): Promise<StaffDetails> {
    return this.restClient.getResource(`/staff?username=${username}`)
  }

  getManagedPrisonerIdsByStaffCode(staffCode: string): Promise<string[]> {
    return this.restClient.getResource(`/staff/${staffCode}/managedPrisonerIds`)
  }

  /** @deprecated use getStaffDetailsByStaffCode instead */
  getManagedPrisonerIdsByStaffId(staffIdentifier: number): Promise<string[]> {
    return this.restClient.getResource(`/managedPrisonerIds?staffId=${staffIdentifier}`)
  }

  getCommunityManager(offenderNo: string): Promise<CommunityManager> {
    return this.restClient.getResource(`/case/${offenderNo}/communityManager`)
  }

  getAllProbationAreas(): Promise<KeyValue[]> {
    return this.restClient.getResource(`/providers`)
  }

  async getProbationArea(probationAreaCode: string): Promise<ProviderWithLaus> {
    return (await this.restClient.getResource(`/providers/${probationAreaCode}`)) ?? { localAdminUnits: [] }
  }

  async getLduWithTeams(probationAreaCode: string, lauCode: string): Promise<LocalAdminUnit> {
    return (
      (await this.restClient.getResource(`/providers/${probationAreaCode}/localAdminUnits/${lauCode}`)) ?? { teams: [] }
    )
  }

  addResponsibleOfficerRole(username: string): Promise<void> {
    return this.addRole(username, config.delius.responsibleOfficerRoleId)
  }

  async addRole(username: string, code: string): Promise<void> {
    try {
      await this.restClient.putResource(`/users/${username}/roles/${code}`, '')
    } catch (error) {
      // Do nothing
    }
  }

  getUser(username: string): Promise<DeliusUser> {
    return this.restClient.getResource(`/users/${username}/details`)
  }
}
