import MigrationService, { Flag } from '../../server/services/migrationService'
import { delius } from '../../server/config'
import { DeliusClient, DeliusUser, StaffDetails } from '../../server/data/deliusClient'

jest.mock('../../server/data/deliusClient')

describe('MigrationService', () => {
  let deliusClient: jest.Mocked<DeliusClient>
  let userAdminService
  let nomisClient
  const nomisClientBuilder = jest.fn()
  let migrationService: MigrationService

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

    deliusClient = new DeliusClient(undefined) as jest.Mocked<DeliusClient>
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
      userAdminService.getRoUser.mockResolvedValue({ staffIdentifier: 123 })
      deliusClient.getStaffDetailsByStaffIdentifier.mockResolvedValue({
        username: 'delius-user',
      } as StaffDetails)

      await migrationService.addRoRole('USER')
      expect(deliusClient.getStaffDetailsByStaffIdentifier).toHaveBeenCalledWith(123)
      expect(deliusClient.addResponsibleOfficerRole).toHaveBeenCalledWith('delius-user')
    })
  })

  describe('addDeliusRole', () => {
    test('should call add role on delius client', async () => {
      await migrationService.addDeliusRole('delius-user', 'role-1')
      expect(deliusClient.addRole).toHaveBeenCalledWith('delius-user', 'role-1')
    })
  })

  describe('getDeliusRoles', () => {
    test('get roles when missing user', async () => {
      deliusClient.getUser.mockResolvedValue(null)

      const result = await migrationService.getDeliusRoles('user-1')

      expect(result).toStrictEqual(null)
    })
  })

  describe('getStaffDetails', () => {
    test('get staff details by staff identifier', async () => {
      userAdminService.getRoUser.mockResolvedValue({ staffIdentifier: 123, nomisId: 'user-1', email: 'user@gov.uk' })

      nomisClient.getAuthUser.mockResolvedValue({ username: 'user-1', enabled: true })

      deliusClient.getStaffDetailsByStaffIdentifier.mockResolvedValue({
        username: 'user-1',
        email: 'user@gov.uk',
      } as StaffDetails)
      deliusClient.getUser.mockResolvedValue({
        roles: [delius.responsibleOfficerRoleId],
        enabled: true,
      } as DeliusUser)

      const result = await migrationService.getStaffDetails('token', 'user-1')

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
          staffIdentifier: 123,
          nomisId: 'user-1',
          email: 'user@gov.uk',
        },
      })
    })

    test('get staff details by staff code', async () => {
      userAdminService.getRoUser.mockResolvedValue({ deliusId: 'ABC', nomisId: 'user-1', email: 'user@gov.uk' })

      nomisClient.getAuthUser.mockResolvedValue({ username: 'user-1', enabled: true })

      deliusClient.getStaffDetailsByStaffCode.mockResolvedValue({
        username: 'user-1',
        email: 'user@gov.uk',
      } as StaffDetails)
      deliusClient.getUser.mockResolvedValue({
        roles: [delius.responsibleOfficerRoleId],
        enabled: true,
      } as DeliusUser)

      const result = await migrationService.getStaffDetails('token', 'user-1')

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
          deliusId: 'ABC',
          nomisId: 'user-1',
          email: 'user@gov.uk',
        },
      })
    })

    test('get staff details, unlinked user', async () => {
      userAdminService.getRoUser.mockResolvedValue({
        deliusId: 'ABC',
        staffIdentifier: 123,
        nomisId: 'user-1',
        email: 'user@gov.uk',
      })

      nomisClient.getAuthUser.mockResolvedValue({ username: 'user-1', enabled: true })

      deliusClient.getStaffDetailsByStaffIdentifier.mockResolvedValue({ staffId: 1 } as StaffDetails)

      const result = await migrationService.getStaffDetails('token', 'user-1')

      expect(result).toStrictEqual({
        authUser: {
          enabled: true,
          roles: [],
          username: 'user-1',
        },
        deliusUser: {
          staffId: 1,
        },
        flags: [Flag.UNLINKED_ACCOUNT],
        licenceUser: {
          deliusId: 'ABC',
          staffIdentifier: 123,
          email: 'user@gov.uk',
          nomisId: 'user-1',
        },
      })
    })

    test('get staff details, mismatched details without RO role', async () => {
      userAdminService.getRoUser.mockResolvedValue({
        deliusId: 'ABC',
        staffIdentifier: 1,
        nomisId: 'user-1',
        email: 'user@gov.uk',
      })

      nomisClient.getAuthUser.mockResolvedValue({ username: 'user-1', enabled: true })

      deliusClient.getStaffDetailsByStaffIdentifier.mockResolvedValue({
        username: 'delius-user',
        staffId: 1,
        email: 'delius-user@gov.uk',
      } as StaffDetails)
      deliusClient.getUser.mockResolvedValue({
        username: 'delius-user',
        roles: [],
        enabled: true,
      })

      const result = await migrationService.getStaffDetails('token', 'user-1')

      expect(result).toStrictEqual({
        authUser: {
          enabled: true,
          roles: [],
          username: 'user-1',
        },
        deliusUser: {
          email: 'delius-user@gov.uk',
          staffId: 1,
          username: 'delius-user',
        },
        flags: [Flag.REQUIRES_RO_ROLE, Flag.EMAIL_MISMATCH, Flag.USERNAME_MISMATCH],
        licenceUser: {
          deliusId: 'ABC',
          staffIdentifier: 1,
          email: 'user@gov.uk',
          nomisId: 'user-1',
        },
      })
    })
  })

  test('get staff details, mismatches missing delius email', async () => {
    userAdminService.getRoUser.mockResolvedValue({
      deliusId: 'ABC',
      staffIdentifier: 1,
      nomisId: 'user-1',
      email: 'user@gov.uk',
    })

    nomisClient.getAuthUser.mockResolvedValue({ username: 'user-1', enabled: true })

    deliusClient.getStaffDetailsByStaffIdentifier.mockResolvedValue({
      username: 'delius-user',
      staffId: 1,
    } as StaffDetails)
    deliusClient.getUser.mockResolvedValue({
      roles: [],
      enabled: true,
    } as DeliusUser)

    const result = await migrationService.getStaffDetails('token', 'user-1')

    expect(result).toStrictEqual({
      authUser: {
        enabled: true,
        roles: [],
        username: 'user-1',
      },
      deliusUser: {
        staffId: 1,
        username: 'delius-user',
      },
      flags: [Flag.REQUIRES_RO_ROLE, Flag.EMAIL_MISMATCH, Flag.USERNAME_MISMATCH],
      licenceUser: {
        deliusId: 'ABC',
        staffIdentifier: 1,
        email: 'user@gov.uk',
        nomisId: 'user-1',
      },
    })
  })

  test('get staff details, missing accounts in auth and delius', async () => {
    userAdminService.getRoUser.mockResolvedValue({ deliusId: 'ABC', nomisId: 'user-1', email: 'user@gov.uk' })

    nomisClient.getAuthUser.mockResolvedValue(null)

    deliusClient.getStaffDetailsByStaffCode.mockResolvedValue(null)

    const result = await migrationService.getStaffDetails('token', 'user-1')

    expect(result).toStrictEqual({
      authUser: null,
      deliusUser: null,
      flags: [Flag.MISSING_DELIUS_USER, Flag.MISSING_AUTH_USER],
      licenceUser: {
        deliusId: 'ABC',
        email: 'user@gov.uk',
        nomisId: 'user-1',
      },
    })
  })

  test('get staff details, needs vary role', async () => {
    userAdminService.getRoUser.mockResolvedValue({
      deliusId: 'ABC',
      staffIdentifier: 1,
      nomisId: 'user-1',
      email: 'user@gov.uk',
    })

    nomisClient.getAuthUser.mockResolvedValue({ username: 'user-1', enabled: true })
    nomisClient.getAuthUserRoles.mockResolvedValue([
      { roleCode: 'LICENCES_RO' },
      { roleCode: 'LICENCE_VARY' },
      { roleCode: 'GLOBAL_SEARCH' },
    ])
    deliusClient.getStaffDetailsByStaffIdentifier.mockResolvedValue({
      username: 'user-1',
      email: 'user@gov.uk',
    } as StaffDetails)
    deliusClient.getUser.mockResolvedValue({
      username: 'user-1',
      roles: [delius.responsibleOfficerRoleId],
      enabled: true,
    })

    const result = await migrationService.getStaffDetails('token', 'user-1')

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
        deliusId: 'ABC',
        staffIdentifier: 1,
        nomisId: 'user-1',
        email: 'user@gov.uk',
      },
    })
  })

  test('get staff details, error calling auth', async () => {
    userAdminService.getRoUser.mockResolvedValue({
      deliusId: 'ABC',
      staffIdentifier: 1,
      nomisId: 'user-1',
      email: 'user@gov.uk',
    })

    nomisClient.getAuthUser.mockRejectedValue(Error('bang!'))
    deliusClient.getStaffDetailsByStaffIdentifier.mockResolvedValue({
      username: 'user-1',
      email: 'user@gov.uk',
    } as StaffDetails)
    deliusClient.getUser.mockResolvedValue({
      username: 'user-1',
      roles: [delius.responsibleOfficerRoleId],
      enabled: true,
    })

    const result = await migrationService.getStaffDetails('token', 'user-1')

    expect(result).toStrictEqual({
      authUser: undefined,
      deliusUser: {
        username: 'user-1',
        email: 'user@gov.uk',
      },
      flags: [Flag.AUTH_CANNOT_LOAD],
      licenceUser: {
        deliusId: 'ABC',
        staffIdentifier: 1,
        nomisId: 'user-1',
        email: 'user@gov.uk',
      },
    })
  })
})
