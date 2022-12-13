export enum LicenceStage {
  UNSTARTED = 'UNSTARTED',
  DEFAULT = 'ELIGIBILITY',
  ELIGIBILITY = 'ELIGIBILITY',
  PROCESSING_RO = 'PROCESSING_RO',
  PROCESSING_CA = 'PROCESSING_CA',
  APPROVAL = 'APPROVAL',
  DECIDED = 'DECIDED',
  MODIFIED = 'MODIFIED',
  MODIFIED_APPROVAL = 'MODIFIED_APPROVAL',
  VARY = 'VARY',
}

export type YesNo = 'Yes' | 'No'

export interface AddressAndPhone {
  addressLine1?: string
  addressLine2?: string
  addressTown?: string
  postCode?: string
  telephone?: string
}

export interface Approval {
  release?: {
    decision?: YesNo
    decisionMaker?: string
    notedComments?: string
    reason?: string | Array<string>
    reasonForDecision?: string
  }
}

export interface BassReferral {
  approvedPremisesAddress?: AddressAndPhone
  bassAreaCheck?: {
    approvedPremisesRequiredYesNo?: YesNo
    bassAreaCheckSeen?: string
    bassAreaReason?: string
    bassAreaSuitable?: YesNo
  }
  bassOffer?: {
    addressLine1?: string
    addressLine2?: string
    addressTown?: string
    postCode?: string
    telephone?: string
    bassAccepted?: 'Yes' | 'Unavailable' | 'Unsuitable'
    bassArea?: string
    bassOfferDetails?: string
  }
  bassRequest?: {
    additionalInformation?: string
    bassRequested?: YesNo
    proposedCounty?: string
    proposedTown?: string
    specificArea?: YesNo
  }
}

export interface CurrentBassReferral extends BassReferral {
  approvedPremises?: { required?: YesNo }
  bassWithdrawn?: { decision?: YesNo }
}

export interface RejectedBassReferral extends BassReferral {
  rejectionReason?: 'offender' | 'area'
  withdrawal?: 'offer' | 'request'
}

export interface AddressReview {
  addressReviewComments?: string
  consent?: string
  electricity?: string
  homeVisitConducted?: string
}

export interface Curfew {
  addressWithdrawn?: { enterNewAddress?: string }
  approvedPremises?: { required?: YesNo }
  approvedPremisesAddress?: AddressAndPhone
  consentWithdrawn?: { enterNewAddress?: YesNo }
  curfewAddressReview?: AddressReview
  curfewHours?: {
    allFrom?: string
    allUntil?: string
    daySpecificInputs?: string
    fridayFrom?: string
    fridayUntil?: string
    mondayFrom?: string
    mondayUntil?: string
    saturdayFrom?: string
    saturdayUntil?: string
    sundayFrom?: string
    sundayUntil?: string
    thursdayFrom?: string
    thursdayUntil?: string
    tuesdayFrom?: string
    tuesdayUntil?: string
    wednesdayFrom?: string
    wednesdayUntil?: string
  }
  firstNight?: { firstNightFrom?: string; firstNightUntil?: string }
}

export interface Document {
  template?: { decision?: string; offenceCommittedBeforeFeb2015?: YesNo }
}

export interface Eligibility {
  crdTime?: { decision?: YesNo; dmApproval?: YesNo }
  exceptionalCircumstances?: { decision?: YesNo }
  excluded?: { decision?: YesNo; reason?: Array<string> }
  suitability?: { decision?: YesNo; reason?: Array<string> }
}

export interface FinalChecks {
  confiscationOrder?: { comments?: string; confiscationUnitConsulted?: YesNo; decision?: YesNo }
  onRemand?: { decision?: YesNo }
  postpone?: { decision?: YesNo; postponeReason?: string }
  refusal?: { decision?: YesNo; outOfTimeReasons?: string; reason?: string }
  seriousOffence?: { decision?: YesNo }
}

export type BespokeCondition = { approved?: string; text?: string }

export type AdditionalConditions = AdditionalConditionsV1 | AdditionalConditionsV2

export type AdditionalConditionsV1 = {
  ATTENDALL?: any
  ATTENDDEPENDENCY?: any
  ATTENDDEPENDENCYINDRUGSSECTION?: any
  ATTENDSAMPLE?: any
  COMPLYREQUIREMENTS?: { abuseAndBehaviours: any }
  CONFINEADDRESS?: any
  DRUG_TESTING?: any
  EXCLUSIONADDRESS?: any
  EXCLUSIONAREA?: any
  HOMEVISITS?: any
  INTIMATERELATIONSHIP?: any
  NOCAMERAPHONE?: any
  NOCHILDRENSAREA?: any
  NOCOMMUNICATEVICTIM?: any
  NOCONTACTASSOCIATE?: any
  NOCONTACTNAMED?: any
  NOCONTACTPRISONER?: any
  NOINTERNET?: any
  NORESIDE?: any
  NOTIFYPASSPORT?: any
  NOTIFYRELATIONSHIP?: any
  NOUNSUPERVISEDCONTACT?: any
  NOWORKWITHAGE?: any
  ONEPHONE?: any
  REMAINADDRESS?: any
  REPORTTO?: any
  SURRENDERPASSPORT?: any
  USAGEHISTORY?: any
  VEHICLEDETAILS?: any
}

export type AdditionalConditionsV2 = {
  RESIDE_AT_SPECIFIC_PLACE?: any
  NO_RESIDE?: any
  NO_CONTACT_PRISONER?: any
  NO_CONTACT_ASSOCIATE?: any
  NO_CONTACT_SEX_OFFENDER?: any
  NO_CONTACT_NAMED?: any
  NO_UNSUPERVISED_CONTACT?: any
  NO_COMMUNICATE_VICTIM?: any
  ATTENDDEPENDENCY?: any
  ATTEND_DEPENDENCY_IN_DRUGS_SECTION?: any
  ATTEND_ALL?: { appointmentProfessions: any }
  HOME_VISITS?: any
  RETURN_TO_UK?: any
  NO_WORK_WITH_AGE?: any
  COMPLY_REQUIREMENTS?: { abuseAndBehaviours: any }
  SPECIFIC_ITEM?: any
  SURRENDER_PASSPORT?: any
  ONE_PHONE?: any
  NO_INTERNET?: any
  USAGE_HISTORY?: any
  NO_CAMERA?: any
  CAMERA_APPROVAL?: any
  NO_CAMERA_PHONE?: any
  INTIMATE_RELATIONSHIP?: any
  NOTIFY_RELATIONSHIP?: any
  NOTIFY_PASSPORT?: any
  VEHICLE_DETAILS?: any
  REMAIN_ADDRESS?: any
  CONFINE_ADDRESS?: any
  POLICE_ESCORT?: any
  NO_CHILDRENS_AREA?: any
  EXCLUSION_ADDRESS?: any
  EXCLUSION_AREA?: any
  REPORT_TO?: any
  POLYGRAPH?: any
  DONT_HAMPER_DRUG_TESTING?: any
  DRUG_TESTING?: any
  ELECTRONIC_MONITORING_INSTALLATION?: any
  ELECTRONIC_MONITORING_TRAIL?: any
  CURFEW_UNTIL_INSTALLATION?: any
  ALCOHOL_MONITORING?: any
  ALLOW_POLICE_SEARCH?: any
}

export interface LicenceConditions {
  additional?: AdditionalConditions
  bespoke?: Array<BespokeCondition>
  conditionsSummary?: { additionalConditionsJustification?: string }
  standard?: { additionalConditionsRequired?: YesNo }
}

export interface CurfewAddress {
  addressLine1?: string
  addressLine2?: string
  addressTown?: string
  postCode?: string
  telephone?: string
  additionalInformation?: string
  cautionedAgainstResident?: YesNo
  occupier?: { isOffender?: string; name?: string; relationship?: string }
  residentOffenceDetails?: string
  residents?: Array<{ age?: string; name?: string; relationship?: string }>
}
export interface ProposedAddress {
  addressProposed?: { decision?: YesNo }
  curfewAddress?: CurfewAddress
  optOut?: { decision?: YesNo }
  rejections?: Array<{
    address?: CurfewAddress
    addressReview?: { curfewAddressReview?: AddressReview }
    riskManagement?: { proposedAddressSuitable?: YesNo; unsuitableReason?: string }
    withdrawalReason?: string
  }>
}
export interface Reporting {
  reportingDate?: { reportingDate?: string; reportingTime?: string }
  reportingInstructions?: {
    buildingAndStreet1?: string
    buildingAndStreet2?: string
    name?: string
    organisation?: string
    postcode?: string
    reportingDate?: string
    reportingTime?: string
    telephone?: string
    townOrCity?: string
  }
}

export type RiskManagement = RiskManagementV1 | RiskManagementV2

type RiskManagementV1 = {
  version: '1'
  awaitingInformation?: string
  emsInformation?: string
  emsInformationDetails?: string
  nonDisclosableInformation?: string
  nonDisclosableInformationDetails?: string
  planningActions?: string
  proposedAddressSuitable?: string
  riskManagementDetails?: string
  unsuitableReason?: string
}

type RiskManagementV2 = {
  version: '2'
  awaitingOtherInformation?: string
  emsInformation?: string
  emsInformationDetails?: string
  hasConsideredChecks?: string
  nonDisclosableInformation?: string
  nonDisclosableInformationDetails?: string
  proposedAddressSuitable?: string
  riskManagementDetails?: string
  unsuitableReason?: string
}

export interface Risk {
  riskManagement?: RiskManagement
}

export interface Vary {
  approval?: { jobTitle?: string; name?: string }
  evidence?: { evidence?: string }
}

export interface Victim {
  victimLiaison?: { decision?: YesNo; victimLiaisonDetails?: string }
}

export interface Licence {
  bassRejections?: Array<RejectedBassReferral>
  curfew?: Curfew
  victim?: Victim
  document?: Document
  vary?: Vary
  finalChecks?: FinalChecks
  proposedAddress?: ProposedAddress
  variedFromLicenceNotInSystem?: boolean
  bassReferral?: CurrentBassReferral
  reporting?: Reporting
  eligibility?: Eligibility
  licenceConditions?: LicenceConditions
  approval?: Approval
  risk?: Risk
}
