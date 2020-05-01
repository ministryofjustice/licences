const mockDeliusClient = () => ({
  addResponsibleOfficerRole: jest.fn(),
  getAllLdusForProbationArea: jest.fn(),
  getAllOffenderManagers: jest.fn(),
  getAllProbationAreas: jest.fn(),
  getAllTeamsForLdu: jest.fn(),
  getROPrisoners: jest.fn(),
  getStaffDetailsByStaffCode: jest.fn(),
  getStaffDetailsByUsername: jest.fn(),
})

const mockProbationTeamsClient = () => ({
  getFunctionalMailbox: jest.fn(),
  getProbationAreaCodes: jest.fn(),
  getProbationArea: jest.fn(),
  setLduFunctionalMailbox: jest.fn(),
  deleteLduFunctionalMailbox: jest.fn(),
  setProbationTeamFunctionalMailbox: jest.fn(),
  deleteProbationTeamFunctionalMailbox: jest.fn(),
  getLduWithProbationTeams: jest.fn(),
})

module.exports = {
  mockDeliusClient,
  mockProbationTeamsClient,
}
