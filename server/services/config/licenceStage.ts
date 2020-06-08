export enum licenceStage {
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
  caToRo: licenceStage.PROCESSING_RO,
  caToDm: licenceStage.APPROVAL,
  caToDmResubmit: licenceStage.APPROVAL,
  roToCa: licenceStage.PROCESSING_CA,
  dmToCa: licenceStage.DECIDED,
  dmToCaReturn: licenceStage.PROCESSING_CA,
  caToDmRefusal: licenceStage.APPROVAL,
  roToCaAddressRejected: licenceStage.ELIGIBILITY,
  roToCaOptedOut: licenceStage.ELIGIBILITY,
}

export const isPostApproval = (stage: licenceStage): boolean =>
  ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(stage)
