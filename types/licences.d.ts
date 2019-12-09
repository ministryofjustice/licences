import { StaffDetails } from './delius'

interface ResponsibleOfficer {
  deliusId: string
  name: string
  nomsNumber: string
  lduCode: string
  lduDescription: string
  probationAreaCode: string
  probationAreaDescription: string
  isAllocated: boolean,
}

interface ResponsibleOfficerAndContactDetails extends ResponsibleOfficer {
  email?: string
  organisation?: string
  functionalMailbox?: string
}

interface Error {
  message: string
}

type Result<T> = T | Error

export type ResponsibleOfficerResult = Result<ResponsibleOfficer>
export type ResponsibleOfficerAndContactDetailsResult = Result<ResponsibleOfficerAndContactDetails>

export interface RoService {
  getStaffByCode: (staffCode: string) => Promise<StaffDetails>
  getStaffByUsername: (username: string) => Promise<StaffDetails>
  getROPrisoners: (deliusStaffCode: string) => Promise<any>
  findResponsibleOfficer: (bookingId: number, token: string) => Promise<ResponsibleOfficerResult>
  findResponsibleOfficerByOffenderNo: (offenderNumber: string) => Promise<ResponsibleOfficerResult>
}

export interface RoContactDetailsService {
  getFunctionalMailBox: (deliusId: String) => Promise<String>
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
