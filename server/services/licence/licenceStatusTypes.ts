import { LicenceStage } from '../../data/licenceTypes'
import { TaskState } from '../config/taskState'

export type LicenceStatus = {
  stage: LicenceStage
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
  exclusion?: TaskState
  crdTime?: TaskState
  suitability?: TaskState
  eligibility?: TaskState
  optOut?: TaskState
  curfewAddress?: TaskState
  bassRequest?: TaskState
  bassAreaCheck?: TaskState
  bassOffer?: TaskState
  bassAddress?: TaskState
  riskManagement?: TaskState
  curfewAddressReview?: TaskState
  curfewHours?: TaskState
  reportingInstructions?: TaskState
  licenceConditions?: TaskState
  seriousOffenceCheck?: TaskState
  onRemandCheck?: TaskState
  confiscationOrderCheck?: TaskState
  finalChecks?: TaskState
  approval?: TaskState
  createLicence?: TaskState
  approvedPremisesAddress?: TaskState
  victim?: TaskState
}
