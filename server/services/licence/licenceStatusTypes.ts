import { taskState } from '../config/taskState'
import { licenceStage } from '../config/licenceStage'

export type LicenceStatus = {
  stage: licenceStage
  postApproval: boolean
  decisions: Decisions
  tasks: Tasks
}

export type Decisions = {
  // eligibility
  eligible?: boolean
  excluded?: boolean
  unsuitable?: boolean
  unsuitableResult?: boolean
  exceptionalCircumstances?: boolean
  insufficientTime?: boolean
  insufficientTimeContinue?: boolean
  insufficientTimeStop?: boolean

  // BASS address related
  bassReferralNeeded?: boolean
  bassAreaSpecified?: boolean
  bassAreaSuitable?: boolean
  bassAreaNotSuitable?: boolean
  bassAccepted?: 'Yes' | 'Unavailable' | 'Unsuitable'
  bassWithdrawn?: boolean
  bassWithdrawalReason?: string

  // Other address
  curfewAddressApproved?: boolean
  curfewAddressRejected?: boolean
  addressUnsuitable?: boolean
  approvedPremisesRequired?: boolean
  offenderIsMainOccupier?: boolean
  addressReviewFailed?: boolean
  addressWithdrawn?: boolean

  // condition related decisions
  standardOnly?: boolean
  additional?: number
  bespoke?: number
  bespokeRejected?: number
  bespokePending?: number

  // Approval
  finalChecksPass?: boolean
  finalChecksRefused?: boolean
  approved?: boolean
  refused?: boolean
  caRefused?: boolean
  dmRefused?: boolean
  refusalReason?: string
  decisionComments?: string

  riskManagementNeeded?: boolean
  awaitingRiskInformation?: boolean
  victimLiaisonNeeded?: boolean
  optedOut?: boolean

  seriousOffence?: boolean
  onRemand?: boolean
  confiscationOrder?: boolean
  postponed?: boolean
}

export type Tasks = {
  exclusion?: taskState
  crdTime?: taskState
  suitability?: taskState
  eligibility?: taskState
  optOut?: taskState
  curfewAddress?: taskState
  bassRequest?: taskState
  bassAreaCheck?: taskState
  bassOffer?: taskState
  bassAddress?: taskState
  riskManagement?: taskState
  curfewAddressReview?: taskState
  curfewHours?: taskState
  reportingInstructions?: taskState
  licenceConditions?: taskState
  seriousOffenceCheck?: taskState
  onRemandCheck?: taskState
  confiscationOrderCheck?: taskState
  finalChecks?: taskState
  approval?: taskState
  createLicence?: taskState
  approvedPremisesAddress?: taskState
  victim?: taskState
}
