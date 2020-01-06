const createRoContactDetailsService = require('../../server/services/roContactDetailsService')

describe('roContactDetailsService', () => {
  let service
  let userAdminService
  let probationTeamsService
  let roService

  beforeEach(() => {
    userAdminService = {
      getRoUserByDeliusId: jest.fn(),
    }
    roService = {
      getStaffByCode: jest.fn(),
      findResponsibleOfficer: jest.fn().mockResolvedValue({
        deliusId: 'delius-1',
        lduDescription: 'Sheffield',
        lduCode: 'SHF-1',
      }),
    }
    probationTeamsService = {
      getFunctionalMailbox: jest.fn(),
    }

    service = createRoContactDetailsService(userAdminService, roService, probationTeamsService, true)
  })

  describe('getFunctionalMailBox', () => {
    test('successfully returns local data', async () => {
      const fullContactInfo = {
        email: 'ro@ro.email',
        orgEmail: 'admin@ro.email',
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
      }

      userAdminService.getRoUserByDeliusId = jest.fn().mockReturnValue(fullContactInfo)

      const result = await service.getFunctionalMailBox('delius-1')

      expect(result).toBe('admin@ro.email')
      expect(userAdminService.getRoUserByDeliusId).toHaveBeenCalledWith('delius-1')
      expect(roService.getStaffByCode).not.toHaveBeenCalled()
    })

    test('local data not stored, retrieve from external service is enabled', async () => {
      userAdminService.getRoUserByDeliusId.mockReturnValue(null)
      probationTeamsService.getFunctionalMailbox.mockResolvedValue('ro-org@email.com')
      roService.getStaffByCode.mockResolvedValue({ email: 'ro@email.com' })

      const result = await service.getFunctionalMailBox('delius-1')

      expect(result).toBe('ro-org@email.com')
      expect(userAdminService.getRoUserByDeliusId).toHaveBeenCalledWith('delius-1')
      expect(roService.getStaffByCode).toHaveBeenCalledWith('delius-1')
    })

    test('local data not stored, retrieve from external service is disabled', async () => {
      service = createRoContactDetailsService(userAdminService, roService, probationTeamsService, false)

      userAdminService.getRoUserByDeliusId = jest.fn().mockReturnValue(null)

      const result = await service.getFunctionalMailBox('delius-1')

      expect(result).toBe(undefined)
      expect(userAdminService.getRoUserByDeliusId).toHaveBeenCalledWith('delius-1')
      expect(probationTeamsService.getFunctionalMailbox).not.toHaveBeenCalled()
      expect(roService.getStaffByCode).not.toHaveBeenCalled()
    })
  })

  describe('getResponsibleOfficerWithContactDetails', () => {
    test('successfully returns local data', async () => {
      const fullContactInfo = {
        email: 'ro@ro.email',
        orgEmail: 'admin@ro.email',
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
      }

      userAdminService.getRoUserByDeliusId = jest.fn().mockReturnValue(fullContactInfo)

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).toEqual({
        deliusId: 'delius-1',
        email: 'ro@ro.email',
        functionalMailbox: 'admin@ro.email',
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
        isUnlinkedAccount: false,
        lduCode: 'SHF-1',
        lduDescription: 'Sheffield',
      })
      expect(userAdminService.getRoUserByDeliusId).toHaveBeenCalledWith('delius-1')
      expect(roService.getStaffByCode).not.toHaveBeenCalledWith('delius-1')
    })

    test('Fail to find responsible officer', async () => {
      roService.findResponsibleOfficer.mockResolvedValue({ message: 'could not find' })
      userAdminService.getRoUserByDeliusId = jest.fn().mockReturnValue(null)

      const result = await service.getResponsibleOfficerWithContactDetails('delius-1')

      expect(result).toEqual({ message: 'could not find' })
      expect(userAdminService.getRoUserByDeliusId).not.toHaveBeenCalled()
    })

    test('no staff record local, found in delius', async () => {
      userAdminService.getRoUserByDeliusId.mockResolvedValue(null)

      probationTeamsService.getFunctionalMailbox.mockResolvedValue('ro-org@email.com')
      roService.getStaffByCode.mockResolvedValue({ email: 'ro@ro.email.com', username: 'user-1' })

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).toEqual({
        deliusId: 'delius-1',
        email: 'ro@ro.email.com',
        functionalMailbox: 'ro-org@email.com',
        lduDescription: 'Sheffield',
        organisation: 'Sheffield (SHF-1)',
        isUnlinkedAccount: false,
        lduCode: 'SHF-1',
      })
      expect(userAdminService.getRoUserByDeliusId).toHaveBeenCalledWith('delius-1')
      expect(roService.getStaffByCode).toHaveBeenCalledWith('delius-1')
    })

    test('no staff record local, linked user found in delius', async () => {
      userAdminService.getRoUserByDeliusId.mockResolvedValue(null)

      probationTeamsService.getFunctionalMailbox.mockResolvedValue('ro-org@email.com')
      roService.getStaffByCode.mockResolvedValue({ email: 'ro@ro.email.com', username: 'user-1' })

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).toEqual({
        deliusId: 'delius-1',
        email: 'ro@ro.email.com',
        functionalMailbox: 'ro-org@email.com',
        lduDescription: 'Sheffield',
        isUnlinkedAccount: false,
        lduCode: 'SHF-1',
        organisation: 'Sheffield (SHF-1)',
      })
      expect(userAdminService.getRoUserByDeliusId).toHaveBeenCalledWith('delius-1')
      expect(roService.getStaffByCode).toHaveBeenCalledWith('delius-1')
    })

    it('no staff record local, looking up details in delius is disabled', async () => {
      service = createRoContactDetailsService(userAdminService, roService, probationTeamsService, false)

      userAdminService.getRoUserByDeliusId.mockResolvedValue(null)
      probationTeamsService.getFunctionalMailbox.mockResolvedValue('ro-org@email.com')
      roService.getStaffByCode.mockResolvedValue({})

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).toEqual({
        deliusId: 'delius-1',
        email: undefined,
        functionalMailbox: undefined,
        lduDescription: 'Sheffield',
        isUnlinkedAccount: false,
        lduCode: 'SHF-1',
        organisation: 'Sheffield (SHF-1)',
      })
      expect(userAdminService.getRoUserByDeliusId).toHaveBeenCalledWith('delius-1')
      expect(roService.getStaffByCode).not.toHaveBeenCalled()
    })
    it('no staff record local, un-linked user found in delius', async () => {
      userAdminService.getRoUserByDeliusId.mockResolvedValue(null)

      roService.findResponsibleOfficer.mockResolvedValue({
        deliusId: 'delius-1',
        lduDescription: 'Sheffield',
        lduCode: 'SHF-1',
      })
      probationTeamsService.getFunctionalMailbox.mockResolvedValue('ro-org@email.com')
      roService.getStaffByCode.mockResolvedValue({})

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).toEqual({
        deliusId: 'delius-1',
        email: undefined,
        functionalMailbox: 'ro-org@email.com',
        lduDescription: 'Sheffield',
        isUnlinkedAccount: true,
        lduCode: 'SHF-1',
        organisation: 'Sheffield (SHF-1)',
      })
      expect(userAdminService.getRoUserByDeliusId).toHaveBeenCalledWith('delius-1')
      expect(roService.getStaffByCode).toHaveBeenCalledWith('delius-1')
    })

    test('no staff record local, found in delius but not linked user', async () => {
      userAdminService.getRoUserByDeliusId.mockResolvedValue(null)
      roService.getStaffByCode.mockResolvedValue({
        message: 'Staff and user not linked in delius: delius-1',
      })

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).toEqual({
        message: 'Staff and user not linked in delius: delius-1',
      })
      expect(userAdminService.getRoUserByDeliusId).toHaveBeenCalledWith('delius-1')
      expect(roService.getStaffByCode).toHaveBeenCalledWith('delius-1')
    })
  })
})
