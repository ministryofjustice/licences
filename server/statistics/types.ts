import { Licence } from '../data/licenceTypes'

export interface RowConsumer<R> {
  consumeRows(rows: Array<R>): void
}

export interface AuditRow {
  action?: string
  details?: any
}

export interface LicenceRow {
  licence: Licence
  booking_id: number
  stage: string
  template?: string
  version?: number
  vary_version?: number
}
