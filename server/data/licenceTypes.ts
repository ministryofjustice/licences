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
    bassAccepted?: 'Yes' | 'Unavailable'
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

export interface LicenceConditions {
  additional?: {
    ATTENDALL?: any
    ATTENDDEPENDENCY?: any
    ATTENDDEPENDENCYINDRUGSSECTION?: any
    ATTENDSAMPLE?: any
    COMPLYREQUIREMENTS?: any
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
  bespoke?: Array<{ approved?: string; text?: string }>
  conditionsSummary?: { additionalConditionsJustification?: string }
  standard?: { additionalConditionsRequired?: string }
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

export interface RiskManagement {
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
