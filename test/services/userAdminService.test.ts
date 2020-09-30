import nock from 'nock'
import { mocked } from 'ts-jest/utils'
import { RoUser, userClient } from '../../server/data/userClient'
import UserAdminService from '../../server/services/userAdminService'
import { ProbationTeamsClient } from '../../server/data/probationTeamsClient'

jest.mock('../../server/data/userClient')
jest.mock('../../server/data/probationTeamsClient')

const mockUserClient = mocked(userClient, true)

describe('userAdminService', () => {
  let nomisClient
  let service: UserAdminService

  const user1: RoUser = {
    nomisId: 'user1',
    deliusId: 'd1',
    first: 'f1',
    last: 'l1',
    onboarded: true,
    staffIdentifier: 1,
  }

  const user2: RoUser = {
    nomisId: 'user2',
    deliusId: 'd2',
    first: 'f2',
    last: 'l2',
    onboarded: true,
    staffIdentifier: 2,
  }

  beforeEach(() => {
    nomisClient = {
      getUserInfo: jest.fn().mockReturnValue({}),
      getOffenderSentencesByBookingId: jest.fn().mockReturnValue({}),
      getBooking: jest.fn().mockReturnValue({}),
    }

    mockUserClient.getRoUsers.mockResolvedValue([user1, user2])
    mockUserClient.getRoUser.mockResolvedValue(user2)
    mockUserClient.getRoUserByStaffIdentifier.mockResolvedValue(user2)
    mockUserClient.updateRoUser.mockResolvedValue({})
    mockUserClient.deleteRoUser.mockResolvedValue({})

    const probationTeamClient: ProbationTeamsClient = undefined

    const nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)

    service = new UserAdminService(nomisClientBuilder, userClient, probationTeamClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getRoUsers', () => {
    test('should call user client', async () => {
      const result = await service.getRoUsers()

      expect(userClient.getRoUsers).toHaveBeenCalled()
      expect(userClient.getRoUsers).toHaveBeenCalledWith(undefined)
      expect(result[0].nomisId).toBe('user1')
    })
  })

  describe('getRoUser', () => {
    test('should call user client with params', async () => {
      const result = await service.getRoUser('id')

      expect(userClient.getRoUser).toHaveBeenCalled()
      expect(userClient.getRoUser).toHaveBeenCalledWith('id')
      expect(result.nomisId).toBe('user2')
    })
  })

  describe('getRoUserByDeliusId', () => {
    test('should call user client with params', async () => {
      const result = await service.getRoUserByStaffIdentifier(1)

      expect(userClient.getRoUserByStaffIdentifier).toHaveBeenCalled()
      expect(userClient.getRoUserByStaffIdentifier).toHaveBeenCalledWith(1)
      expect(result.nomisId).toBe('user2')
    })
  })

  describe('updateRoUser', () => {
    test('should reject when user already exists', async () => {
      return expect(
        service.updateRoUser('token', 'newNomisId', {
          staffIdentifier: 2,
        })
      ).rejects.toEqual(Error('Delius staff Identifier already exists in RO mappings'))
    })

    test('should call user client with params', async () => {
      mockUserClient.getRoUser.mockResolvedValue(undefined)
      mockUserClient.getRoUserByStaffIdentifier.mockResolvedValue(undefined)

      const roUserUpdate = {
        originalDeliusId: 'originalDeliusId',
        staffIdentifier: 1,
      }
      await service.updateRoUser('token', 'originalNomisId', roUserUpdate)

      expect(userClient.updateRoUser).toHaveBeenCalled()
      expect(userClient.updateRoUser).toHaveBeenCalledWith('originalNomisId', 1)
    })
  })

  describe('deleteRoUser', () => {
    test('should call user client with params', async () => {
      await service.deleteRoUser('id')

      expect(userClient.deleteRoUser).toHaveBeenCalled()
      expect(userClient.deleteRoUser).toHaveBeenCalledWith('id')
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
