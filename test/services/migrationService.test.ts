import MigrationService, { Flag } from '../../server/services/migrationService'
import { delius } from '../../server/config'

describe('MigrationService', () => {
  let deliusClient
  let userAdminService
  let nomisClient
  const nomisClientBuilder = jest.fn()
  let migrationService

  beforeEach(() => {
    nomisClient = {
      disableAuthUser: jest.fn(),
      enableAuthUser: jest.fn(),
      getAuthUser: jest.fn(),
      getAuthUserRoles: jest.fn(),
    }

    userAdminService = {
      getRoUser: jest.fn(),
    }

    deliusClient = {
      addResponsibleOfficerRole: jest.fn(),
      getStaffDetailsByStaffCode: jest.fn(),
      getUser: jest.fn(),
    }

    nomisClientBuilder.mockReturnValue(nomisClient)
    migrationService = new MigrationService(deliusClient, userAdminService, nomisClientBuilder)
  })

  describe('disableAuthAccount', () => {
    test('should call disable on nomis client', async () => {
      await migrationService.disableAuthAccount('token-1', 'USER')
      expect(nomisClientBuilder).toHaveBeenCalledWith('token-1')
      expect(nomisClient.disableAuthUser).toHaveBeenCalledWith('USER')
    })
  })

  describe('enableAuthAccount', () => {
    test('should call enable on nomis client', async () => {
      await migrationService.enableAuthAccount('token-1', 'USER')
      expect(nomisClientBuilder).toHaveBeenCalledWith('token-1')
      expect(nomisClient.enableAuthUser).toHaveBeenCalledWith('USER')
    })
  })

  describe('addRoRole', () => {
    test('should call add role on delius client', async () => {
      userAdminService.getRoUser.mockResolvedValue({ deliusId: 123 })
      deliusClient.getStaffDetailsByStaffCode.mockResolvedValue({ username: 'delius-user' })
      deliusClient.addResponsibleOfficerRole.mockResolvedValue(null)

      await migrationService.addRoRole('USER')
      expect(deliusClient.getStaffDetailsByStaffCode).toHaveBeenCalledWith(123)
      expect(deliusClient.addResponsibleOfficerRole).toHaveBeenCalledWith('delius-user')
    })
  })

  describe('getStaffDetails', () => {
    test('get staff details, no flags', async () => {
      userAdminService.getRoUser.mockResolvedValue({ deliusId: 123, nomisId: 'user-1', email: 'user@gov.uk' })

      nomisClient.getAuthUser.mockResolvedValue({ username: 'user-1', enabled: true })

      deliusClient.getStaffDetailsByStaffCode.mockResolvedValue({ username: 'user-1', email: 'user@gov.uk' })
      deliusClient.getUser.mockResolvedValue({
        roles: [{ name: delius.responsibleOfficerRoleId }],
        enabled: true,
      })

      const result = await migrationService.getStaffDetails('user-1')

      expect(result).toStrictEqual({
        authUser: {
          enabled: true,
          roles: [],
          username: 'user-1',
        },
        deliusUser: {
          username: 'user-1',
          email: 'user@gov.uk',
        },
        flags: [],
        licenceUser: {
          deliusId: 123,
          nomisId: 'user-1',
          email: 'user@gov.uk',
        },
      })
    })

    test('get staff details, unlinked user', async () => {
      userAdminService.getRoUser.mockResolvedValue({ deliusId: 123, nomisId: 'user-1', email: 'user@gov.uk' })

      nomisClient.getAuthUser.mockResolvedValue({ username: 'user-1', enabled: true })

      deliusClient.getStaffDetailsByStaffCode.mockResolvedValue({ staffCode: 'AA123' })

      const result = await migrationService.getStaffDetails('user-1')

      expect(result).toStrictEqual({
        authUser: {
          enabled: true,
          roles: [],
          username: 'user-1',
        },
        deliusUser: {
          staffCode: 'AA123',
        },
        flags: [Flag.UNLINKED_ACCOUNT],
        licenceUser: {
          deliusId: 123,
          email: 'user@gov.uk',
          nomisId: 'user-1',
        },
      })
    })

    test('get staff details, mismatched details without RO role', async () => {
      userAdminService.getRoUser.mockResolvedValue({ deliusId: 123, nomisId: 'user-1', email: 'user@gov.uk' })

      nomisClient.getAuthUser.mockResolvedValue({ username: 'user-1', enabled: true })

      deliusClient.getStaffDetailsByStaffCode.mockResolvedValue({
        username: 'delius-user',
        staffCode: 'AA123',
        email: 'delius-user@gov.uk',
      })
      deliusClient.getUser.mockResolvedValue({
        roles: [],
        enabled: true,
      })

      const result = await migrationService.getStaffDetails('user-1')

      expect(result).toStrictEqual({
        authUser: {
          enabled: true,
          roles: [],
          username: 'user-1',
        },
        deliusUser: {
          email: 'delius-user@gov.uk',
          staffCode: 'AA123',
          username: 'delius-user',
        },
        flags: [Flag.REQUIRES_RO_ROLE, Flag.EMAIL_MISMATCH, Flag.USERNAME_MISMATCH],
        licenceUser: {
          deliusId: 123,
          email: 'user@gov.uk',
          nomisId: 'user-1',
        },
      })
    })
  })

  test('get staff details, mismatches missing delius email', async () => {
    userAdminService.getRoUser.mockResolvedValue({ deliusId: 123, nomisId: 'user-1', email: 'user@gov.uk' })

    nomisClient.getAuthUser.mockResolvedValue({ username: 'user-1', enabled: true })

    deliusClient.getStaffDetailsByStaffCode.mockResolvedValue({
      username: 'delius-user',
      staffCode: 'AA123',
    })
    deliusClient.getUser.mockResolvedValue({
      roles: [],
      enabled: true,
    })

    const result = await migrationService.getStaffDetails('user-1')

    expect(result).toStrictEqual({
      authUser: {
        enabled: true,
        roles: [],
        username: 'user-1',
      },
      deliusUser: {
        staffCode: 'AA123',
        username: 'delius-user',
      },
      flags: [Flag.REQUIRES_RO_ROLE, Flag.EMAIL_MISMATCH, Flag.USERNAME_MISMATCH],
      licenceUser: {
        deliusId: 123,
        email: 'user@gov.uk',
        nomisId: 'user-1',
      },
    })
  })

  test('get staff details, missing accounts in auth and delius', async () => {
    userAdminService.getRoUser.mockResolvedValue({ deliusId: 123, nomisId: 'user-1', email: 'user@gov.uk' })

    nomisClient.getAuthUser.mockResolvedValue(null)

    deliusClient.getStaffDetailsByStaffCode.mockResolvedValue(null)

    const result = await migrationService.getStaffDetails('user-1')

    expect(result).toStrictEqual({
      authUser: null,
      deliusUser: null,
      flags: [Flag.MISSING_DELIUS_USER, Flag.MISSING_AUTH_USER],
      licenceUser: {
        deliusId: 123,
        email: 'user@gov.uk',
        nomisId: 'user-1',
      },
    })
  })

  test('get staff details, needs vary role', async () => {
    userAdminService.getRoUser.mockResolvedValue({ deliusId: 123, nomisId: 'user-1', email: 'user@gov.uk' })

    nomisClient.getAuthUser.mockResolvedValue({ username: 'user-1', enabled: true })
    nomisClient.getAuthUserRoles.mockResolvedValue([
      { roleCode: 'LICENCES_RO' },
      { roleCode: 'LICENCE_VARY' },
      { roleCode: 'GLOBAL_SEARCH' },
    ])
    deliusClient.getStaffDetailsByStaffCode.mockResolvedValue({ username: 'user-1', email: 'user@gov.uk' })
    deliusClient.getUser.mockResolvedValue({
      roles: [{ name: delius.responsibleOfficerRoleId }],
      enabled: true,
    })

    const result = await migrationService.getStaffDetails('user-1')

    expect(result).toStrictEqual({
      authUser: {
        enabled: true,
        roles: ['LICENCES_RO', 'LICENCE_VARY', 'GLOBAL_SEARCH'],
        username: 'user-1',
      },
      deliusUser: {
        username: 'user-1',
        email: 'user@gov.uk',
      },
      flags: [Flag.REQUIRES_VARY_ROLE],
      licenceUser: {
        deliusId: 123,
        nomisId: 'user-1',
        email: 'user@gov.uk',
      },
    })
  })

  test('get staff details, error calling auth', async () => {
    userAdminService.getRoUser.mockResolvedValue({ deliusId: 123, nomisId: 'user-1', email: 'user@gov.uk' })

    nomisClient.getAuthUser.mockRejectedValue(Error('bang!'))
    deliusClient.getStaffDetailsByStaffCode.mockResolvedValue({ username: 'user-1', email: 'user@gov.uk' })
    deliusClient.getUser.mockResolvedValue({
      roles: [{ name: delius.responsibleOfficerRoleId }],
      enabled: true,
    })

    const result = await migrationService.getStaffDetails('user-1')

    expect(result).toStrictEqual({
      authUser: undefined,
      deliusUser: {
        username: 'user-1',
        email: 'user@gov.uk',
      },
      flags: [Flag.AUTH_CANNOT_LOAD],
      licenceUser: {
        deliusId: 123,
        nomisId: 'user-1',
        email: 'user@gov.uk',
      },
    })
  })
})
