import { RoContactDetailsService } from '../../server/services/roContactDetailsService'
import { ProbationTeamsClient } from '../../server/data/probationTeamsClient'
import { RoService } from '../../server/services/roService'
import { StaffDetails } from '../../server/data/deliusClient'
import { ResponsibleOfficer } from '../../types/licences'
import UserAdminService from '../../server/services/userAdminService'
import { RoUser } from '../../server/data/userClient'

jest.mock('../../server/data/probationTeamsClient')
jest.mock('../../server/services/roService')
jest.mock('../../server/services/userAdminService')

const fullContactInfo: RoUser = {
  nomisId: 'nomis-id',
  deliusId: 'delius-id',
  email: 'ro@ro.email',
  orgEmail: 'admin@ro.email',
  organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
  onboarded: true,
  staffIdentifier: 1,
}

describe('roContactDetailsService', () => {
  let service: RoContactDetailsService
  let userAdminService: jest.Mocked<UserAdminService>
  let probationTeamsClient: jest.Mocked<ProbationTeamsClient>
  let roService: jest.Mocked<RoService>

  beforeEach(() => {
    userAdminService = new UserAdminService(undefined, undefined, undefined) as jest.Mocked<UserAdminService>

    roService = new RoService(undefined, undefined) as jest.Mocked<RoService>

    roService.findResponsibleOfficer.mockResolvedValue({
      deliusId: 'XXX-not-used-XXX',
      staffIdentifier: 1,
      name: 'RO',
      teamCode: 'TEAM_CODE',
      teamDescription: 'The Team',
      lduDescription: 'Sheffield',
      lduCode: 'SHF-1',
      probationAreaCode: 'PA1',
      probationAreaDescription: 'Probation Area 1',
    } as ResponsibleOfficer)

    probationTeamsClient = new ProbationTeamsClient(undefined) as jest.Mocked<ProbationTeamsClient>

    service = new RoContactDetailsService(userAdminService, roService, probationTeamsClient)
  })

  describe('getFunctionalMailBox', () => {
    test('successfully returns local data', async () => {
      userAdminService.getRoUserByStaffIdentifier.mockResolvedValue(fullContactInfo)

      const result = await service.getFunctionalMailBox(123, 'token')

      expect(result).toBe('admin@ro.email')
      expect(userAdminService.getRoUserByStaffIdentifier).toHaveBeenCalledWith(1)
      expect(roService.getStaffByStaffIdentifier).not.toHaveBeenCalled()
    })

    test('local data not stored, retrieve from external service is enabled', async () => {
      userAdminService.getRoUserByStaffIdentifier.mockResolvedValue(null)
      probationTeamsClient.getFunctionalMailbox.mockResolvedValue('ro-org@email.com')
      roService.getStaffByStaffIdentifier.mockResolvedValue({ email: 'ro@email.com' } as StaffDetails)

      const result = await service.getFunctionalMailBox(123, 'token')

      expect(result).toBe('ro-org@email.com')
      expect(userAdminService.getRoUserByStaffIdentifier).toHaveBeenCalledWith(1)
      expect(roService.getStaffByStaffIdentifier).toHaveBeenCalledWith(1)
    })
  })

  describe('getResponsibleOfficerWithContactDetails', () => {
    test('successfully returns local data', async () => {
      userAdminService.getRoUserByStaffIdentifier.mockResolvedValue(fullContactInfo)

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).toEqual({
        deliusId: 'XXX-not-used-XXX',
        staffIdentifier: 1,
        email: 'ro@ro.email',
        functionalMailbox: 'admin@ro.email',
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
        isUnlinkedAccount: false,
        lduCode: 'SHF-1',
        lduDescription: 'Sheffield',
        probationAreaCode: 'PA1',
        probationAreaDescription: 'Probation Area 1',
        teamCode: 'TEAM_CODE',
        teamDescription: 'The Team',
        name: 'RO',
      })
      expect(userAdminService.getRoUserByStaffIdentifier).toHaveBeenCalledWith(1)
      expect(roService.getStaffByStaffIdentifier).not.toHaveBeenCalledWith(1)
    })

    test('Fail to find responsible officer', async () => {
      roService.findResponsibleOfficer.mockResolvedValue({ message: 'could not find', code: '404' })
      userAdminService.getRoUserByStaffIdentifier.mockReturnValue(null)

      const result = await service.getResponsibleOfficerWithContactDetails(123, 'token')

      expect(result).toEqual({ message: 'could not find', code: '404' })
      expect(userAdminService.getRoUserByStaffIdentifier).not.toHaveBeenCalled()
    })

    test('no staff record local, found in delius', async () => {
      userAdminService.getRoUserByStaffIdentifier.mockResolvedValue(null)

      probationTeamsClient.getFunctionalMailbox.mockResolvedValue('ro-org@email.com')
      roService.getStaffByStaffIdentifier.mockResolvedValue({
        email: 'ro@ro.email.com',
        username: 'user-1',
      } as StaffDetails)

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).toEqual({
        deliusId: 'XXX-not-used-XXX',
        username: 'user-1',
        email: 'ro@ro.email.com',
        functionalMailbox: 'ro-org@email.com',
        lduDescription: 'Sheffield',
        organisation: 'Sheffield (SHF-1)',
        isUnlinkedAccount: false,
        lduCode: 'SHF-1',
        probationAreaCode: 'PA1',
        probationAreaDescription: 'Probation Area 1',
        teamCode: 'TEAM_CODE',
        teamDescription: 'The Team',
        name: 'RO',
        staffIdentifier: 1,
      })
      expect(userAdminService.getRoUserByStaffIdentifier).toHaveBeenCalledWith(1)
      expect(roService.getStaffByStaffIdentifier).toHaveBeenCalledWith(1)
    })

    test('unmatched staff code but has delius username', async () => {
      userAdminService.getRoUserByStaffIdentifier.mockReturnValue(null)
      roService.getStaffByStaffIdentifier.mockResolvedValue({
        email: 'deliusRo@ro.email.com',
        username: 'delius-user-1',
      } as StaffDetails)
      userAdminService.getRoUserByDeliusUsername.mockResolvedValue(fullContactInfo)

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).toEqual({
        deliusId: 'XXX-not-used-XXX',
        email: 'ro@ro.email',
        functionalMailbox: 'admin@ro.email',
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
        isUnlinkedAccount: false,
        lduCode: 'SHF-1',
        lduDescription: 'Sheffield',
        probationAreaCode: 'PA1',
        probationAreaDescription: 'Probation Area 1',
        teamCode: 'TEAM_CODE',
        teamDescription: 'The Team',
        username: 'delius-user-1',
        name: 'RO',
        staffIdentifier: 1,
      })
      expect(userAdminService.getRoUserByStaffIdentifier).toHaveBeenCalledWith(1)
      expect(roService.getStaffByStaffIdentifier).toHaveBeenCalledWith(1)
      expect(userAdminService.getRoUserByDeliusUsername).toHaveBeenCalledWith('delius-user-1')
    })

    test('no staff record local, linked user found in delius', async () => {
      userAdminService.getRoUserByStaffIdentifier.mockResolvedValue(null)
      probationTeamsClient.getFunctionalMailbox.mockResolvedValue('ro-org@email.com')
      roService.getStaffByStaffIdentifier.mockResolvedValue({
        email: 'ro@ro.email.com',
        username: 'user-1',
      } as StaffDetails)

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).toEqual({
        deliusId: 'XXX-not-used-XXX',
        username: 'user-1',
        email: 'ro@ro.email.com',
        functionalMailbox: 'ro-org@email.com',
        lduDescription: 'Sheffield',
        isUnlinkedAccount: false,
        lduCode: 'SHF-1',
        organisation: 'Sheffield (SHF-1)',
        probationAreaCode: 'PA1',
        probationAreaDescription: 'Probation Area 1',
        teamCode: 'TEAM_CODE',
        teamDescription: 'The Team',
        name: 'RO',
        staffIdentifier: 1,
      })
      expect(userAdminService.getRoUserByStaffIdentifier).toHaveBeenCalledWith(1)
      expect(roService.getStaffByStaffIdentifier).toHaveBeenCalledWith(1)
    })

    it('no staff record local, un-linked user found in delius', async () => {
      userAdminService.getRoUserByStaffIdentifier.mockResolvedValue(null)

      roService.findResponsibleOfficer.mockResolvedValue({
        deliusId: 'XXX-not-used-XXX',
        staffIdentifier: 1,
        lduDescription: 'Sheffield',
        lduCode: 'SHF-1',
      } as ResponsibleOfficer)
      probationTeamsClient.getFunctionalMailbox.mockResolvedValue('ro-org@email.com')
      roService.getStaffByStaffIdentifier.mockResolvedValue({} as StaffDetails)

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).toEqual({
        deliusId: 'XXX-not-used-XXX',
        email: undefined,
        functionalMailbox: 'ro-org@email.com',
        lduDescription: 'Sheffield',
        isUnlinkedAccount: true,
        lduCode: 'SHF-1',
        organisation: 'Sheffield (SHF-1)',
        staffIdentifier: 1,
        username: undefined,
      })
      expect(userAdminService.getRoUserByStaffIdentifier).toHaveBeenCalledWith(1)
      expect(roService.getStaffByStaffIdentifier).toHaveBeenCalledWith(1)
    })

    test('no staff record local, found in delius but not linked user', async () => {
      userAdminService.getRoUserByStaffIdentifier.mockResolvedValue(null)
      roService.getStaffByStaffIdentifier.mockResolvedValue({
        message: 'Staff and user not linked in delius: delius-1',
        code: '404',
      })

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).toEqual({
        message: 'Staff and user not linked in delius: delius-1',
        code: '404',
      })
      expect(userAdminService.getRoUserByStaffIdentifier).toHaveBeenCalledWith(1)
      expect(roService.getStaffByStaffIdentifier).toHaveBeenCalledWith(1)
    })
  })
})
