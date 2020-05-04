const createSignInServiceStub = () => ({
  signIn: jest.fn(),
  refresh: jest.fn(),
  getClientCredentialsTokens: jest.fn().mockReturnValue({ token: 'system-token' }),
})

const createLicenceServiceStub = () => ({
  getLicence: jest.fn().mockReturnValue({ licence: { key: 'value' } }),
  update: jest.fn(),
  updateSection: jest.fn(),
  updateLicenceConditions: jest.fn(),
  deleteLicenceCondition: jest.fn(),
  markForHandover: jest.fn(),
  createLicence: jest.fn(),
  updateAddress: jest.fn(),
  updateAddresses: jest.fn(),
  getEligibilityErrors: jest.fn(),
  addAddress: jest.fn(),
  addSplitDateFields: jest.fn((arg) => arg),
  removeDecision: jest.fn().mockReturnValue({}),
  validateForm: jest.fn().mockReturnValue({}),
  validateFormGroup: jest.fn().mockReturnValue({}),
  rejectProposedAddress: jest.fn().mockReturnValue({}),
  reinstateProposedAddress: jest.fn().mockReturnValue({}),
  createLicenceFromFlatInput: jest.fn().mockReturnValue({}),
  addCurfewHoursInput: jest.fn().mockReturnValue({}),
})

const createLduServiceStub = () => ({
  getAllProbationAreas: () => jest.fn().mockReturnValue([]),
  getLdusForProbationArea: () => jest.fn().mockReturnValue([]),
  updateActiveLdus: () => jest.fn().mockReturnValue(null),
})

const createConditionsServiceStub = () => ({
  getStandardConditions: jest.fn(),
  getAdditionalConditions: jest.fn(),
  formatConditionInputs: jest.fn(),
  populateLicenceWithConditions: jest.fn().mockReturnValue({}),
})

const createPrisonerServiceStub = () =>
  /** @type {any} */ ({
    getOrganisationContactDetails: jest.fn(),
    getEstablishment: jest.fn(),
    getEstablishmentForPrisoner: jest.fn().mockReturnValue(''),
    getPrisonerDetails: jest.fn().mockReturnValue({}),
    getPrisonerImage: jest.fn().mockReturnValue({ image: 'image' }),
    getPrisonerPersonalDetails: jest
      .fn()
      .mockReturnValue({ firstName: 'fn', lastName: 'ln', dateOfBirth: '1980-01-01' }),
    getDestinations: jest.fn(),
  })

const createPdfServiceStub = () => ({
  getPdfLicenceData: jest.fn(),
  checkAndTakeSnapshot: jest.fn(),
  getPdf: jest.fn(),
  generatePdf: jest.fn(),
  updateLicenceType: jest.fn(),
})

const createFormServiceStub = () => ({
  generatePdf: jest.fn(),
})

const createRoServiceStub = () => ({
  findResponsibleOfficer: jest.fn(),
  getStaffByCode: jest.fn(),
  getROPrisoners: jest.fn(),
  getStaffByUsername: jest.fn(),
  findResponsibleOfficerByOffenderNo: jest.fn(),
})

const createUserAdminServiceStub = () => ({
  getRoUsers: jest.fn(),
  getRoUser: jest.fn(),
  getRoUserByDeliusId: jest.fn().mockReturnValue({}),
  updateRoUser: jest.fn(),
  deleteRoUser: jest.fn(),
  addRoUser: jest.fn(),
  findRoUsers: jest.fn(),
  verifyUserDetails: jest.fn(),
})

const createWarningsClientStub = () => ({
  raiseWarning: jest.fn(),
  acknowledgeWarnings: jest.fn(),
  getOutstandingWarnings: () => jest.fn(),
  getAcknowledgedWarnings: () => jest.fn(),
})

const createNotificationServiceStub = () => ({
  notify: jest.fn(),
  getNotificationData: jest.fn(),
})

const caseListServiceStub = {
  getHdcCaseList: jest.fn().mockReturnValue([]),
}

const createNomisPushServiceStub = () => ({
  pushStatus: jest.fn(),
  pushChecksPassed: jest.fn(),
})

const createCaServiceStub = {
  getReasonForNotContinuing: jest.fn().mockReturnValue([]),
}

module.exports = {
  createSignInServiceStub,
  createLicenceServiceStub,
  createConditionsServiceStub,
  createPrisonerServiceStub,
  caseListServiceStub,
  createNomisPushServiceStub,
  createPdfServiceStub,
  createFormServiceStub,
  createUserAdminServiceStub,
  createNotificationServiceStub,
  createWarningsClientStub,
  createCaServiceStub,
  createLduServiceStub,
  createRoServiceStub,
}
