import { Moment } from 'moment'
import {
  LduIdentifer,
  LocalDeliveryUnitDto,
  ProbationAreaDto,
  ProbationTeamIdentifier,
  ProbationTeamsClient,
} from '../types/probationTeams'
import {
  CommunityOrPrisonOffenderManager,
  DeliusClient,
  Ldu,
  Page,
  ProbationArea,
  ProbationTeam,
  StaffDetails,
} from '../types/delius'

import { AuditClient, AuditDto } from '../types/audit'

export interface DeliusClientMock extends DeliusClient {
  getStaffDetailsByStaffCode: jest.Mock<Promise<StaffDetails>, [string]>
  getStaffDetailsByUsername: jest.Mock<Promise<StaffDetails>, [string]>
  getROPrisoners: jest.Mock<Promise<any>, [string]>
  getAllOffenderManagers: jest.Mock<Promise<Array<CommunityOrPrisonOffenderManager>>, [string]>
  getAllProbationAreas: jest.Mock<Promise<Page<ProbationArea>>, []>
  getAllLdusForProbationArea: jest.Mock<Promise<Page<Ldu>>, [string]>
  getAllTeamsForLdu: jest.Mock<Promise<Page<ProbationTeam>>, [string, string]>
  addResponsibleOfficerRole: jest.Mock<Promise<void>, [string]>
}

export const mockDeliusClient: () => DeliusClientMock = () => ({
  addResponsibleOfficerRole: jest.fn(),
  getAllLdusForProbationArea: jest.fn(),
  getAllOffenderManagers: jest.fn(),
  getAllProbationAreas: jest.fn(),
  getAllTeamsForLdu: jest.fn(),
  getROPrisoners: jest.fn(),
  getStaffDetailsByStaffCode: jest.fn(),
  getStaffDetailsByUsername: jest.fn(),
})

export interface ProbationTeamsClientMock extends ProbationTeamsClient {
  getFunctionalMailbox: jest.Mock<Promise<string>, [ProbationTeamIdentifier]>
  getProbationAreaCodes: jest.Mock<Promise<Array<string>>, []>
  getProbationArea: jest.Mock<Promise<ProbationAreaDto>, [string]>
  setLduFunctionalMailbox: jest.Mock<Promise<void>, [LduIdentifer, string]>
  deleteLduFunctionalMailbox: jest.Mock<Promise<void>, [LduIdentifer]>
  setProbationTeamFunctionalMailbox: jest.Mock<Promise<void>, [ProbationTeamIdentifier, string]>
  deleteProbationTeamFunctionalMailbox: jest.Mock<Promise<void>, [ProbationTeamIdentifier]>
  getLduWithProbationTeams: jest.Mock<Promise<LocalDeliveryUnitDto>, [LduIdentifer]>
}

export const mockProbationTeamsClient: () => ProbationTeamsClientMock = () => ({
  getFunctionalMailbox: jest.fn(),
  getProbationAreaCodes: jest.fn(),
  getProbationArea: jest.fn(),
  setLduFunctionalMailbox: jest.fn(),
  deleteLduFunctionalMailbox: jest.fn(),
  setProbationTeamFunctionalMailbox: jest.fn(),
  deleteProbationTeamFunctionalMailbox: jest.fn(),
  getLduWithProbationTeams: jest.fn(),
})

export interface AuditMock extends AuditClient {
  record: jest.Mock<Promise<void>, [string, string, object]>
  getEvents: jest.Mock<Promise<Array<AuditDto>>, [string, object, Moment, Moment]>
  getEvent: jest.Mock<Promise<AuditDto>, [number]>
  getEventsForBooking: jest.Mock<Promise<Array<AuditDto>>, [number]>
  delete: jest.Mock<Promise<void>, []>
}

export const mockAudit: () => AuditMock = () => ({
  record: jest.fn(),
  getEvents: jest.fn(),
  getEvent: jest.fn(),
  getEventsForBooking: jest.fn(),
  delete: jest.fn(),
})
