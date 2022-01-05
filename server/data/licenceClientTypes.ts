import { Licence, LicenceStage } from './licenceTypes'

export type ConditionVersion = 1 | 2

export interface Case {
  licence: Licence
  booking_id: number
  stage: LicenceStage
  version: number
  additional_conditions_version: ConditionVersion
}

export interface CaseWithApprovedVersion extends Case {
  transition_date: Date
  approved_version: number
}

export interface CaseWithVaryVersion extends Case {
  vary_version: number
}

export interface ApprovedLicenceVersion {
  version: number
  vary_version: number
  template: string
  timestamp: Date
}

export interface DeliusIds {
  staffIdentifier?: number
  deliusUsername?: string
}
