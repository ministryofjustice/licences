const nock = require('nock')

const createUserService = require('../../server/services/userAdminService')

describe('userAdminService', () => {
  let userClient
  let nomisClient
  let signInService
  let prisonerService
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
      getCasesRequiringRo: jest.fn().mockReturnValue(),
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

    signInService = {
      getClientCredentialsTokens: jest.fn().mockReturnValue({ token: 'system-token' }),
    }

    prisonerService = {
      getResponsibleOfficer: jest.fn().mockReturnValue({}),
    }

    const nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)

    service = createUserService(nomisClientBuilder, userClient, signInService, prisonerService)
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
      })

      expect(userClient.updateRoUser).toHaveBeenCalled()
      expect(userClient.updateRoUser).toHaveBeenCalledWith('nomisId', 1, 3, 4, 5, 6, 7, 8, 9, 10, 11)
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

  describe('getIncompleteRoUsers', () => {
    test('should call user client but not proceed if no bookingIds', async () => {
      userClient.getCasesRequiringRo = jest.fn().mockReturnValue([])

      const result = await service.getIncompleteRoUsers()

      expect(userClient.getCasesRequiringRo).toHaveBeenCalled()
      expect(userClient.getCasesRequiringRo).toHaveBeenCalledWith()
      expect(prisonerService.getResponsibleOfficer).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    test('should call getResponsibleOfficer for each booking ID', async () => {
      userClient.getCasesRequiringRo.mockReturnValue([1, 2])

      await service.getIncompleteRoUsers()

      expect(prisonerService.getResponsibleOfficer).toHaveBeenCalledTimes(2)
      expect(prisonerService.getResponsibleOfficer).toHaveBeenCalledWith(1, 'system-token')
      expect(prisonerService.getResponsibleOfficer).toHaveBeenCalledWith(2, 'system-token')
    })

    test('should not lookup staff records if none required', async () => {
      userClient.getCasesRequiringRo = jest.fn().mockReturnValue([1, 2])
      prisonerService.getResponsibleOfficer = jest.fn().mockReturnValue({})

      await service.getIncompleteRoUsers()

      expect(userClient.getRoUserByDeliusId).not.toHaveBeenCalled()
    })

    test('should lookup staff record for each unique assignedId', async () => {
      userClient.getCasesRequiringRo.mockReturnValue([1, 2, 3])
      prisonerService.getResponsibleOfficer
        .mockReturnValueOnce({ deliusId: 'delius0', name: 'deliusName0' })
        .mockReturnValueOnce({ deliusId: 'delius1', name: 'deliusName1' })
        .mockReturnValueOnce({ deliusId: 'delius1', name: 'deliusName2' })

      await service.getIncompleteRoUsers()

      expect(userClient.getRoUserByDeliusId).toHaveBeenCalledTimes(2)
      expect(userClient.getRoUserByDeliusId).toHaveBeenCalledWith('delius0')
      expect(userClient.getRoUserByDeliusId).toHaveBeenCalledWith('delius1')
    })

    test('should add offender nomis for each incomplete', async () => {
      userClient.getCasesRequiringRo.mockReturnValue([1, 2, 3])
      prisonerService.getResponsibleOfficer
        .mockReturnValueOnce({ deliusId: 'delius0', name: 'deliusName0' })
        .mockReturnValueOnce({ deliusId: 'delius1', name: 'deliusName1' })
        .mockReturnValueOnce({ deliusId: 'delius2', name: 'deliusName2' })
      userClient.getRoUserByDeliusId.mockReturnValue(null)

      await service.getIncompleteRoUsers()

      expect(nomisClient.getBooking).toHaveBeenCalledTimes(3)
      expect(nomisClient.getBooking).toHaveBeenCalledWith(1)
      expect(nomisClient.getBooking).toHaveBeenCalledWith(2)
      expect(nomisClient.getBooking).toHaveBeenCalledWith(3)
    })

    test('should not return if present and onboarded', async () => {
      userClient.getCasesRequiringRo = jest.fn().mockReturnValue([1])
      prisonerService.getResponsibleOfficer = jest.fn().mockReturnValue({ deliusId: 'delius1', name: 'deliusName1' })
      userClient.getRoUserByDeliusId = jest.fn().mockReturnValue({ onboarded: true })

      const result = await service.getIncompleteRoUsers()

      expect(result).toEqual([])
    })

    test('should return mapped if present but not onboarded', async () => {
      userClient.getCasesRequiringRo = jest.fn().mockReturnValue([1])
      prisonerService.getResponsibleOfficer = jest.fn().mockReturnValue({ deliusId: 'delius1', name: 'deliusName1' })
      userClient.getRoUserByDeliusId = jest.fn().mockReturnValue({ onboarded: false })
      nomisClient.getBooking = jest.fn().mockReturnValue({ offenderNo: 'off1' })

      const result = await service.getIncompleteRoUsers()

      expect(result).toEqual([
        {
          assignedId: 'delius1',
          assignedName: 'deliusName1',
          bookingId: 1,
          mapped: true,
          offenderNo: 'off1',
          onboarded: false,
        },
      ])
    })

    test('should return unmapped if not present', async () => {
      userClient.getCasesRequiringRo = jest.fn().mockReturnValue([1])
      prisonerService.getResponsibleOfficer = jest.fn().mockReturnValue({ deliusId: 'delius1', name: 'deliusName1' })
      userClient.getRoUserByDeliusId = jest.fn().mockReturnValue(null)
      nomisClient.getBooking = jest.fn().mockReturnValue({ offenderNo: 'off1' })

      const result = await service.getIncompleteRoUsers()

      expect(result).toEqual([
        {
          assignedId: 'delius1',
          assignedName: 'deliusName1',
          bookingId: 1,
          mapped: false,
          offenderNo: 'off1',
        },
      ])
    })
  })
})
