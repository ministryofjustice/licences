interface Human {
  forenames: string
  surname: string
}

interface KeyValue {
  code: string
  description: string
}

interface Team {
  code: string
  description: string
  telephone: string
  localDeliveryUnit: KeyValue
  district: KeyValue
  borough: KeyValue
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

interface ProbationArea {
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
  isResponsibleOfficer: boolean
  isPrisonOffenderManager: boolean
  isUnallocated: boolean
  staff: Human
  team: Team
  probationArea: ProbationArea
  fromDate: Date
}

interface StaffDetails {
  username: string;
  email: string;
  staffCode: string;
  staff: Human;
  teams: Team[];
}

interface ProbationArea {
  code: string;
  description: string;
}

interface Ldu {
  code: string;
  description: string;
}

export interface DeliusClient {
  getStaffDetailsByStaffCode: (staffCode : string) => Promise<StaffDetails>
  getStaffDetailsByUsername: (username: string) => Promise<StaffDetails>
  getROPrisoners: (deliusStaffCode: string) => Promise<any>
  getAllOffenderManagers: (offenderNumber: string) =>  Promise<Array<CommunityOrPrisonOffenderManager>>
  getAllProbationAreas: ()=> Promise<Array<ProbationArea>>
  getAllLdusForProbationArea: (probationAreaCode: string)=> Promise<Array<Ldu>>
}

