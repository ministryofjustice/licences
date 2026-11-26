import { KeyValue } from '../server/data/deliusClient'

export interface ResponsibleOfficer {
  deliusId: string
  staffIdentifier: number
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

export interface ResponsibleOfficerAndContactDetails extends ResponsibleOfficer {
  /** This officer's user and staff record are not linked in delius, false if unknown */
  isUnlinkedAccount: boolean
  /** email and delius username, will be null if unlinked account and not stored locally */
  email?: string
  /** Will be null when contact details are stored locally  */
  username?: string
  organisation?: string
  functionalMailbox?: string
}

export interface Error {
  message: string
  code: string
}

export type Result<T> = T | Error

export type ResponsibleOfficerResult = Result<ResponsibleOfficer>
export type ResponsibleOfficerAndContactDetailsResult = Result<ResponsibleOfficerAndContactDetails>

export interface RoContactDetailsService {
  getFunctionalMailBox: (deliusId: string) => Promise<string>
  getResponsibleOfficerWithContactDetails: (
    bookingId: number,
    token: string,
  ) => Promise<ResponsibleOfficerAndContactDetailsResult>
}

interface PrisonerDetails {
  firstName: string
  lastname: string
  offenderNo: string
}

type NotificationArgs = {
  responsibleOfficer: ResponsibleOfficerAndContactDetails
  bookingId: number
  prisoner: PrisonerDetails
  notificationType: string
  prison: string
  transitionDate?: string
  sendingUserName: string
}

export interface PrisonerService {
  getPrisonerDetails: (bookingId: number, token: string) => Promise<any>
  getEstablishmentForPrisoner: (bookingId: number, token: string) => Promise<any>
  getEstablishment: (locationId: number, token: string) => Promise<any>
  getPrisonerImage: (imageId: number, token: string) => Promise<any>
  getPrisonerPersonalDetails: (bookingId: number, token: string) => Promise<any>
  getOrganisationContactDetails: (role: string, bookingId: number, token: string) => Promise<any>
  getDestinationForRole: (
    role: string,
    bookingId: number,
    token: string,
  ) => Promise<{ destination: Destination; submissionTarget: any }>
  getDestinations: (
    senderRole,
    receiverRole,
    bookingId,
    token,
  ) => Promise<{ submissionTarget: any; source: Destination; target: Destination }>
}

interface LicenceDetailsforCSV {
  prisonerNumber: string
  prisonId: string
  transitionDate: string
  HDCEDate: string
}

interface ProbationArea {
  code: string
  description: string
  ldus: Array<LduStatus>
}

export interface LduStatus {
  code: string
  description: string
  active: boolean
}

export type PrisonDestination = {
  type: string
  agencyId: string
}

export type ProbationDestination = {
  type: string
  probationAreaCode: string
  lduCode: string
}

export type Destination = PrisonDestination | ProbationDestination
