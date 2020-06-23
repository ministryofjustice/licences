import { Licence } from '../data/licenceTypes'

export interface RowConsumer<R> {
  consumeRows(rows: Array<R>): void
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

  pdfLicence = 'PDF Licence',

  vary = 'Vary',

  optOut = 'OptOut',
}
