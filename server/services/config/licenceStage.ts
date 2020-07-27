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

export const transitions = {
  caToRo: LicenceStage.PROCESSING_RO,
  caToDm: LicenceStage.APPROVAL,
  caToDmResubmit: LicenceStage.APPROVAL,
  roToCa: LicenceStage.PROCESSING_CA,
  dmToCa: LicenceStage.DECIDED,
  dmToCaReturn: LicenceStage.PROCESSING_CA,
  caToDmRefusal: LicenceStage.APPROVAL,
  roToCaAddressRejected: LicenceStage.ELIGIBILITY,
  roToCaOptedOut: LicenceStage.ELIGIBILITY,
}

export const isPostApproval = (stage: LicenceStage): boolean =>
  ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(stage)
