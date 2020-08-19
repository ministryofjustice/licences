const nock = require('nock')

const createUserService = require('../../server/services/userAdminService')

describe('userAdminService', () => {
  let userClient
  let nomisClient
  let service

  const user1 = {
    nomis_id: 'user1',
    staff_id: 'd1',
    first_name: 'f1',
    last_name: 'l1',
  }

  const user2 = {
    nomis_id: 'user2',
    staff_id: 'd2',
    first_name: 'f2',
    last_name: 'l2',
  }

  beforeEach(() => {
    userClient = {
      getRoUsers: jest.fn().mockReturnValue([user1, user2]),
      getCasesRequiringRo: jest.fn(),
      getRoUser: jest.fn().mockReturnValue(user2),
      getRoUserByDeliusId: jest.fn().mockReturnValue(user2),
      updateRoUser: jest.fn().mockReturnValue({}),
      deleteRoUser: jest.fn().mockReturnValue({}),
      addRoUser: jest.fn().mockReturnValue({}),
    }

    nomisClient = {
      getUserInfo: jest.fn().mockReturnValue({}),
      getOffenderSentencesByBookingId: jest.fn().mockReturnValue({}),
      getBooking: jest.fn().mockReturnValue({}),
    }

    /** @type {any} */
    const probationTeamClient = {}

    const nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)

    service = createUserService(nomisClientBuilder, userClient, probationTeamClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getRoUsers', () => {
    test('should call user client', async () => {
      const result = await service.getRoUsers()

      expect(userClient.getRoUsers).toHaveBeenCalled()
      expect(userClient.getRoUsers).toHaveBeenCalledWith()
      expect(result[0].nomis_id).toBe('user1')
    })
  })

  describe('getRoUser', () => {
    test('should call user client with params', async () => {
      const result = await service.getRoUser('id')

      expect(userClient.getRoUser).toHaveBeenCalled()
      expect(userClient.getRoUser).toHaveBeenCalledWith('id')
      expect(result.nomis_id).toBe('user2')
    })
  })

  describe('getRoUserByDeliusId', () => {
    test('should call user client with params', async () => {
      const result = await service.getRoUserByDeliusId('id')

      expect(userClient.getRoUserByDeliusId).toHaveBeenCalled()
      expect(userClient.getRoUserByDeliusId).toHaveBeenCalledWith('id')
      expect(result.nomis_id).toBe('user2')
    })
  })

  describe('updateRoUser', () => {
    test('should reject when user already exists', async () => {
      return expect(
        service.updateRoUser('nomisId', 'newNomisId', 'deliusId', 'newDeliusId', 'first', 'last')
      ).rejects.toEqual(Error('Nomis ID already exists in RO mappings'))
    })

    test('should call user client with params', async () => {
      userClient.getRoUser.mockResolvedValue()
      userClient.getRoUserByDeliusId.mockResolvedValue()

      await service.updateRoUser('token', 'nomisId', {
        nomisId: 1,
        originalDeliusId: 2,
        deliusId: 3,
        first: 4,
        last: 5,
        organisation: 6,
        jobRole: 7,
        email: 8,
        orgEmail: 9,
        telephone: 10,
        onboarded: 11,
        deliusUsername: 12,
      })

      expect(userClient.updateRoUser).toHaveBeenCalled()
      expect(userClient.updateRoUser).toHaveBeenCalledWith('nomisId', 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
    })
  })

  describe('deleteRoUser', () => {
    test('should call user client with params', async () => {
      await service.deleteRoUser('id')

      expect(userClient.deleteRoUser).toHaveBeenCalled()
      expect(userClient.deleteRoUser).toHaveBeenCalledWith('id')
    })
  })

  describe('addRoUser', () => {
    test('should reject when user already exists', async () => {
      return expect(service.addRoUser('nomisId', 'deliusId', 'first', 'last')).rejects.toEqual(
        Error('Nomis ID already exists in RO mappings')
      )
    })

    test('should call user client to check for existing, then to update', async () => {
      userClient.getRoUser.mockResolvedValue()
      userClient.getRoUserByDeliusId.mockResolvedValue()

      await service.addRoUser('token', {
        nomisId: 'nomisId',
        deliusId: 2,
        first: 3,
        last: 4,
        organisation: 5,
        jobRole: 6,
        email: 7,
        orgEmail: 8,
        telephone: 9,
        onboarded: 10,
      })

      expect(userClient.getRoUser).toHaveBeenCalled()
      expect(userClient.getRoUser).toHaveBeenCalledWith('nomisId')

      expect(userClient.addRoUser).toHaveBeenCalled()
      expect(userClient.addRoUser).toHaveBeenCalledWith('nomisId', 2, 3, 4, 5, 6, 7, 8, 9, 10)
    })
  })

  describe('verifyUserDetails', () => {
    test('should call nomis client with params', async () => {
      await service.verifyUserDetails('token', 'userName')

      expect(nomisClient.getUserInfo).toHaveBeenCalled()
      expect(nomisClient.getUserInfo).toHaveBeenCalledWith('userName')
    })
  })
})
