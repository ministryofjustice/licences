import { StaffDetails, Ldu, ProbationArea } from './delius'

interface ResponsibleOfficer {
  deliusId: string
  name: string
  nomsNumber: string
  teamCode: string
  teamDescription: string
  lduCode: string
  lduDescription: string
  probationAreaCode: string
  probationAreaDescription: string
  isAllocated: boolean
}

interface ResponsibleOfficerAndContactDetails extends ResponsibleOfficer {
  /** This officer's user and staff record are not linked in delius, false if unknown */
  isUnlinkedAccount: boolean,
  email?: string
  organisation?: string
  functionalMailbox?: string
}

interface Error {
  message: string
  code: string
}

type Result<T> = T | Error

export type ResponsibleOfficerResult = Result<ResponsibleOfficer>
export type ResponsibleOfficerAndContactDetailsResult = Result<ResponsibleOfficerAndContactDetails>

export interface RoService {
  getStaffByCode: (staffCode: string) => Promise<Result<StaffDetails>>
  getStaffByUsername: (username: string) => Promise<StaffDetails>
  getROPrisoners: (deliusStaffCode: string, token: string) => Promise<any>
  findResponsibleOfficer: (bookingId: number, token: string) => Promise<ResponsibleOfficerResult>
  findResponsibleOfficerByOffenderNo: (offenderNumber: string) => Promise<ResponsibleOfficerResult>
}

export interface RoContactDetailsService {
  getFunctionalMailBox: (deliusId: string) => Promise<string>
  getResponsibleOfficerWithContactDetails: (
    bookingId: number,
    token: string
  ) => Promise<ResponsibleOfficerAndContactDetailsResult>
}

type NotificationArgs = {
  responsibleOfficer: ResponsibleOfficerAndContactDetails
  bookingId: number
  notificationType: string
  prison: string
  transitionDate?: string
  sendingUserName: string
}

export interface RoNotificationSender {
  notificationTypes: any
  sendNotifications: (args: NotificationArgs) => Promise<Array<any>>
  getNotifications: (
    responsibleOfficer: ResponsibleOfficerAndContactDetails,
    personalisation: any,
    config: any
  ) => Array<any>
}

export interface PrisonerService {
  getPrisonerDetails: (bookingId: number, token: string) => Promise<any>
  getResponsibleOfficer: (bookingId: number, token: string) => Promise<Result<ResponsibleOfficer>>
  getEstablishmentForPrisoner: (bookingId: number, token: string) => Promise<any>
  getEstablishment: (locationId: number, token: string) => Promise<any>
  getPrisonerImage: (imageId: number, token: string) => Promise<any>
  getPrisonerPersonalDetails: (bookingId: number, token: string) => Promise<any>
  getOrganisationContactDetails: (role: string, bookingId: number, token: string) => Promise<any>
}

export interface CaService {
  getReasonForNotContinuing: (bookingId: number, token: string) => Promise<string | undefined>
}

export interface Warning {
  id: number
  bookingId: number
  timestamp: Date
  code: string
  messsage: string
}

export interface WarningClient {
  raiseWarning: (bookingId: number, code: string, messsage: string) => Promise<void>
  acknowledgeWarnings: (errorIds: number[]) => Promise<number>
  getOutstandingWarnings: () => Promise<List<Warning>>
  getAcknowledgedWarnings: () => Promise<List<Warning>> 
}

interface ActiveLdu {
  code: string
}

interface LduStatus {
  code: string
  description: string
  active: boolean
}

export interface LduService {
  getAllProbationAreas: () => Promise<Array<ProbationArea>>
  getLdusForProbationArea: (code: string) => Promise<Array<LduStatus>>
  updateActiveLdus: (probationAreaCode: string, activeLdus: string[]) => Promise<void>
}

export interface ActiveLduClient {
  isLduPresent: (lduCode: string, probationAreaCode: string)=> Promise<boolean>
  allActiveLdusInArea: (probationAreaCode: string)=> Promise<ActiveLdu[]>
  updateActiveLdu: (probationAreaCode: string, activeLdus: string[]) => Promise<void>
}
