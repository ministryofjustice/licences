const formsInSection = {
  eligibility: ['excluded', 'suitability', 'crdTime', 'exceptionalCircumstances'],
  proposedAddress: ['optOut', 'addressProposed', 'curfewAddress'],
  bassReferral: ['bassRequest', 'bassAreaCheck', 'bassOffer'],
  curfew: ['curfewHours', 'firstNight'],
  risk: ['riskManagement'],
  reporting: ['reportingInstructions', 'reportingDate'],
  licenceConditions: ['standard', 'additional', 'bespoke'],
}

const sectionContaining = {
  excluded: 'eligibility',
  suitability: 'eligibility',
  crdTime: 'eligibility',
  exceptionalCircumstances: 'eligibility',
  optOut: 'proposedAddress',
  addressProposed: 'proposedAddress',
  bassReferral: 'proposedAddress',
  curfewAddress: 'proposedAddress',
  bassRequest: 'bassReferral',
  bassAreaCheck: 'bassReferral',
  bassOffer: 'bassReferral',
  curfewHours: 'curfew',
  firstNight: 'curfew',
  riskManagement: 'risk',
  reportingInstructions: 'reporting',
  reportingDate: 'reporting',
  standard: 'licenceConditions',
  additional: 'licenceConditions',
  bespoke: 'licenceConditions',
  seriousOffence: 'finalChecks',
  onRemand: 'finalChecks',
  confiscationOrder: 'finalChecks',
  release: 'approval',
  taggingCompany: 'monitoring',
}

const reviewForms = [
  ...formsInSection.eligibility,
  ...formsInSection.proposedAddress,
  ...formsInSection.curfew,
  ...formsInSection.risk,
  ...formsInSection.reporting,
  ...formsInSection.licenceConditions,
]

const bassReviewForms = [
  ...formsInSection.eligibility,
  ...formsInSection.bassReferral,
  ...formsInSection.curfew,
  ...formsInSection.risk,
  ...formsInSection.reporting,
  ...formsInSection.licenceConditions,
]

module.exports = {
  formsInSection,
  sectionContaining,
  reviewForms,
  bassReviewForms,
}
