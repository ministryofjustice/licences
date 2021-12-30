import { RoService } from '../../server/services/roService'
import {
  CommunityOrPrisonOffenderManager,
  DeliusClient,
  ManagedOffender,
  ProbationArea,
  Team,
} from '../../server/data/deliusClient'

jest.mock('../../server/data/deliusClient')

describe('roService', () => {
  let service: RoService
  let nomisClient
  let deliusClient: jest.Mocked<DeliusClient>

  const prototypeRoPrisoner = {
    staffCode: undefined,
    staffIdentifier: undefined,
    offenderId: undefined,
    nomsNumber: undefined,
    crnNumber: undefined,
    offenderSurname: undefined,
    isCurrentRo: undefined,
    isCurrentOm: undefined,
    isCurrentPom: undefined,
    omStartDate: undefined,
    omEndDate: undefined,
  }

  const roPrisoners = [
    { ...prototypeRoPrisoner, nomsNumber: 'A' },
    { ...prototypeRoPrisoner, nomsNumber: 'B' },
    { ...prototypeRoPrisoner, nomsNumber: 'C' },
  ]
  const staffDetails = { staffCode: 'N02A008', staffIdentifier: 1, staff: { forenames: 'x', surname: 'x' }, teams: [] }

  beforeEach(() => {
    nomisClient = {
      getOffenderSentencesByNomisId: jest.fn().mockReturnValue([]),
      getBooking: jest.fn().mockReturnValue({ offenderNo: 1 }),
    }

    const nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)

    deliusClient = new DeliusClient(undefined) as jest.Mocked<DeliusClient>
    deliusClient.getROPrisonersByStaffIdentifier.mockResolvedValue(roPrisoners)
    deliusClient.getStaffDetailsByStaffIdentifier.mockResolvedValue(staffDetails)
    deliusClient.getStaffDetailsByUsername.mockResolvedValue(staffDetails)

    service = new RoService(deliusClient, nomisClientBuilder)
  })

  describe('getStaffByIdentifier', () => {
    test('should call getStaffByIdentifier from deliusClient', async () => {
      await service.getStaffByStaffIdentifier(1)
      expect(deliusClient.getStaffDetailsByStaffIdentifier).toHaveBeenCalled()
      expect(deliusClient.getStaffDetailsByStaffIdentifier).toHaveBeenCalledWith(1)
    })

    test('should return message when 404 in api when getting RO relationship', () => {
      deliusClient.getStaffDetailsByStaffIdentifier.mockResolvedValue(undefined)
      return expect(service.getStaffByStaffIdentifier(1)).resolves.toStrictEqual({
        code: 'STAFF_NOT_PRESENT',
        message: `Staff does not exist in delius: 1`,
      })
    })
  })

  describe('getStaffByUsername', () => {
    test('should call getStaffByCode from deliusClient', async () => {
      await service.getStaffByUsername('code-1')
      expect(deliusClient.getStaffDetailsByUsername).toHaveBeenCalledWith('code-1')
    })

    test('should return message when 404 in api when getting RO relationship', () => {
      deliusClient.getStaffDetailsByUsername.mockResolvedValue(undefined)
      return expect(service.getStaffByUsername('code-1')).resolves.toBe(null)
    })
  })

  describe('getROPrisoners', () => {
    test('should call getROPrisoners from deliusClient && getOffenderSentencesByNomisId from nomisClient', async () => {
      deliusClient.getROPrisonersByStaffIdentifier.mockResolvedValue(roPrisoners)
      await service.getROPrisonersForStaffIdentifier(123, 'token')
      expect(deliusClient.getROPrisonersByStaffIdentifier).toHaveBeenCalled()
      expect(nomisClient.getOffenderSentencesByNomisId).toHaveBeenCalled()
      expect(nomisClient.getOffenderSentencesByNomisId).toHaveBeenCalledWith(['A', 'B', 'C'])
    })

    test('should not call getOffenderSentencesByNomisId when no results from getROPrisoners', async () => {
      deliusClient.getROPrisonersByStaffIdentifier.mockResolvedValue([])
      await service.getROPrisonersForStaffIdentifier(123, 'token')
      expect(deliusClient.getROPrisonersByStaffIdentifier).toHaveBeenCalled()
      expect(nomisClient.getOffenderSentencesByNomisId).toHaveBeenCalled()
    })

    test('should not call getOffenderSentencesByNomisId when no offender numbers are returned from getROPrisoners', async () => {
      deliusClient.getROPrisonersByStaffIdentifier.mockResolvedValue([{}, {}, {}] as ManagedOffender[])
      await service.getROPrisonersForStaffIdentifier(123, 'token')
      expect(deliusClient.getROPrisonersByStaffIdentifier).toHaveBeenCalled()
      expect(nomisClient.getOffenderSentencesByNomisId).toHaveBeenCalledWith([])
    })

    test('should return empty array and explanation message if no eligible releases found', async () => {
      deliusClient.getROPrisonersByStaffIdentifier.mockResolvedValue([])
      const result = await service.getROPrisonersForStaffIdentifier(123, 'token')
      expect(result).toEqual([])
    })

    test('should return empty array when staff member not found in delius', async () => {
      deliusClient.getROPrisonersByStaffIdentifier.mockResolvedValue(undefined)
      const result = await service.getROPrisonersForStaffIdentifier(123, 'token')
      expect(result).toEqual(null)
    })
  })

  describe('findResponsibleOfficer', () => {
    test('should call the api with the offenderNo', async () => {
      deliusClient.getAllOffenderManagers.mockResolvedValue([])

      await service.findResponsibleOfficer('123', 'token')

      expect(nomisClient.getBooking).toHaveBeenCalled()
      expect(nomisClient.getBooking).toHaveBeenCalledWith('123')

      expect(deliusClient.getAllOffenderManagers).toHaveBeenCalled()
      expect(deliusClient.getAllOffenderManagers).toHaveBeenCalledWith(1)
    })

    test('should return the found COM', () => {
      deliusClient.getAllOffenderManagers.mockResolvedValue([
        {
          isResponsibleOfficer: true,
          staff: { forenames: 'Jo', surname: 'Smith' },
          staffCode: 'CODE-1',
          staffId: 1,
          isUnallocated: false,
          team: {
            localDeliveryUnit: { code: 'LDU-1', description: 'LDU-1 Description' },
            code: 'TEAM_1',
            description: 'The Team',
          } as Team,
          probationArea: { code: 'PROB-1', description: 'PROB-1 Description' } as ProbationArea,
        } as CommunityOrPrisonOffenderManager,
      ])

      const expectedComData = {
        deliusId: 'CODE-1',
        staffIdentifier: 1,
        isAllocated: true,
        name: 'Jo Smith',
        nomsNumber: 1,
        teamCode: 'TEAM_1',
        teamDescription: 'The Team',
        lduCode: 'LDU-1',
        lduDescription: 'LDU-1 Description',
        probationAreaCode: 'PROB-1',
        probationAreaDescription: 'PROB-1 Description',
      }

      return expect(service.findResponsibleOfficer('123', 'token')).resolves.toEqual(expectedComData)
    })

    test('offender has not been assigned a COM', () => {
      deliusClient.getAllOffenderManagers.mockResolvedValue([
        { isPrisonOffenderManager: true } as CommunityOrPrisonOffenderManager,
      ])

      const expectedComData = {
        code: 'NO_COM_ASSIGNED',
        message: 'Offender has not been assigned a COM: 1',
      }

      return expect(service.findResponsibleOfficer('123', 'token')).resolves.toEqual(expectedComData)
    })

    test('should throw if error in api when getting ro', () => {
      deliusClient.getAllOffenderManagers.mockRejectedValue(new Error('dead'))
      return expect(service.findResponsibleOfficer('123', 'token')).rejects.toEqual(Error('dead'))
    })

    test('should return message when 404 in api when getting RO relationship', () => {
      deliusClient.getAllOffenderManagers.mockResolvedValue(undefined)
      return expect(service.findResponsibleOfficer('123', 'token')).resolves.toEqual({
        code: 'NO_OFFENDER_NUMBER',
        message: 'Offender number not entered in delius',
      })
    })
  })
})
