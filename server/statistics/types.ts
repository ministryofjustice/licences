import { Licence } from '../data/licenceTypes'

export interface RowConsumer<R> {
  consumeRows(rows: Array<R>): void
}

export enum Actions {
  SEND = 'SEND',
  START = 'LICENCE_RECORD_STARTED',
  PDF = 'CREATE_PDF',
  VARY = 'VARY_NOMIS_LICENCE_CREATED',
  UPDATE = 'UPDATE_SECTION',
}

export interface AuditRow {
  action?: string
  details?: {
    bookingId?: number
    path?: string
    [key: string]: any
  }
}

export interface LicenceRow {
  licence: Licence
  booking_id: number
  stage: string
  template?: string
  version?: number
  vary_version?: number
  started: Date
}

export interface PrisonLocation {
  type: 'prison'
  agencyId: string
}

export interface ProbationLocation {
  type: 'probation'
  lduCode: string
  probationAreaCode: string
}

export interface AuditSendRow {
  timestamp: Date
  booking_id: number
  source?: PrisonLocation | ProbationLocation
  target?: PrisonLocation | ProbationLocation
  transition_type: string
}

export enum Event {
  start = 'Start',

  ineligible = 'Ineligible',

  caToRo = 'CA -> RO',
  caToRoAddress = 'CA -> RO (Address)',
  caToRoBass = 'CA -> RO (Bass)',

  caToDm = 'CA -> DM',
  caToDmRefusal = 'CA -> DM (Refusal)',
  caToDmResubmit = 'CA -> DM (Resubmit)',

  dmToCa = 'DM -> CA',
  dmToCaReturn = 'DM -> CA (Rtn)',

  roToCa = 'RO -> CA',
  roToCaAddressRejected = 'RO -> CA (Rej)',
  roToCaApprovedPremises = 'RO -> CA (AP)',

  pdfLicence = 'PDF Licence',

  vary = 'Vary',

  optOut = 'OptOut',
}
