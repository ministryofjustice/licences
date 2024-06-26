const createUserService = require('../../server/services/userService')

describe('userServiceTest', () => {
  let service
  let nomisClient
  let manageUsersApi
  let signInService

  let user = { token: 'token' }
  const nomisUser = { token: 'token', authSource: 'nomis' }
  const activeCaseLoads = [{ caseLoadId: 'this', currentlyActive: true }, { caseLoadId: 'that' }]

  beforeEach(() => {
    nomisClient = {
      getUserCaseLoads: jest.fn().mockReturnValue(activeCaseLoads),
      putActiveCaseLoad: jest.fn().mockReturnValue({}),
    }
    manageUsersApi = {
      getLoggedInUserInfo: jest.fn().mockReturnValue({ name: 'User Name' }),
      getUserRoles: jest
        .fn()
        .mockReturnValue([{ roleCode: 'LICENCE_CA' }, { roleCode: 'LICENCE_DM' }, { roleCode: 'PRISON' }]),
    }
    signInService = {
      getClientCredentialsTokens: jest.fn().mockResolvedValue('systemToken'),
    }
    const nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)
    const restClientBuilder = jest.fn().mockReturnValue(manageUsersApi)
    service = createUserService(nomisClientBuilder, signInService, restClientBuilder)
  })

  describe('getUserProfile', () => {
    test('should return an object with the profile, first role, all roles and active case load', () => {
      return expect(service.getUserProfile('t', 'rt', 'un')).resolves.toEqual({
        username: 'un',
        activeCaseLoadId: 'this',
        name: 'User Name',
        displayNameInitial: 'U. Name',
        role: 'CA',
        roles: ['CA', 'DM'],
        isPrisonUser: true,
        activeCaseLoad: {
          caseLoadId: 'this',
          currentlyActive: true,
        },
        caseLoads: [{ caseLoadId: 'this', currentlyActive: true }, { caseLoadId: 'that' }],
      })
    })
  })

  describe('getAllRoles', () => {
    test('should return roles and prison users status ', () => {
      return expect(service.getAllRoles(user)).resolves.toEqual({ roles: ['CA', 'DM'], isPrisonUser: true })
    })

    test('should allow multiple roles', () => {
      manageUsersApi.getUserRoles.mockResolvedValue([
        { roleCode: 'LICENCE_CA' },
        { roleCode: 'LICENCE_RO' },
        { roleCode: 'LICENCE_DM' },
        { roleCode: 'PRISON' },
      ])

      return expect(service.getAllRoles(user)).resolves.toEqual({ roles: ['CA', 'RO', 'DM'], isPrisonUser: true })
    })

    test('should filter invalid roles', () => {
      manageUsersApi.getUserRoles.mockResolvedValue([
        {
          roleCode: 'LICENCE_CA',
        },
        {
          roleCode: 'LICENCE_NO',
        },
        {
          roleCode: 'LICENCE_RO',
        },
        {
          roleCode: 'LICENCE_DM',
        },
      ])

      return expect(service.getAllRoles(user)).resolves.toEqual({ roles: ['CA', 'RO', 'DM'], isPrisonUser: false })
    })
  })

  describe('setRole', () => {
    beforeEach(() => {
      user = {
        token: 'token',
        role: 'OLD',
      }
    })

    test('should set the user role to CA', async () => {
      const newUser = await service.setRole('CA', user)
      expect(newUser).toEqual({
        token: 'token',
        role: 'CA',
      })
    })

    test('should set the user role to RO', async () => {
      const newUser = await service.setRole('RO', user)
      expect(newUser).toEqual({
        token: 'token',
        role: 'RO',
      })
    })

    test('should set the user role to DM', async () => {
      const newUser = await service.setRole('DM', user)
      expect(newUser).toEqual({
        token: 'token',
        role: 'DM',
      })
    })

    test('should not set invalid roles role', async () => {
      const newUser = await service.setRole('NO', user)
      expect(newUser).toEqual({
        token: 'token',
        role: 'OLD',
      })
    })
  })

  describe('getAllCaseLoads', () => {
    test('should call getUserCaseLoads from nomis client for nomis user', async () => {
      await service.getAllCaseLoads(nomisUser, 'token')
      expect(nomisClient.getUserCaseLoads).toHaveBeenCalled()
    })

    test('should call getUserCaseLoads from nomis client for other user', async () => {
      await service.getAllCaseLoads(user, 'token')
      expect(nomisClient.getUserCaseLoads).not.toHaveBeenCalled()
    })

    test('should return results for nomis user', async () => {
      const answer = await service.getAllCaseLoads(nomisUser, 'token')
      expect(answer).toEqual(activeCaseLoads)
    })

    test('should return empty for other user', async () => {
      const answer = await service.getAllCaseLoads(user, 'token')
      expect(answer).toEqual([])
    })
  })

  describe('setActiveCaseLoad', () => {
    test('should call putActiveCaseLoad from nomis client', async () => {
      await service.setActiveCaseLoad('id', user)
      expect(nomisClient.putActiveCaseLoad).toHaveBeenCalled()
      expect(nomisClient.putActiveCaseLoad).toHaveBeenCalledWith('id')
    })

    test('should call getUserCaseLoads from nomis client', async () => {
      await service.setActiveCaseLoad('id', user)
      expect(nomisClient.getUserCaseLoads).toHaveBeenCalled()
    })

    test('should set the user caseload with a corresponding id', async () => {
      const result = await service.setActiveCaseLoad('id', user)
      expect(result).toEqual({
        ...user,
        activeCaseLoad: { caseLoadId: 'this', currentlyActive: true },
      })
    })
  })
})
