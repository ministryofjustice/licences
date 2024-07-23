import { RoService } from '../../server/services/roService'
import { DeliusClient, StaffDetails } from '../../server/data/deliusClient'

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

  const roPrisoners = ['A', 'B', 'C']
  const offenderSentences = [
    {
      bookingId: '1',
      offenderNo: 'A1234BC',
      firstName: 'x',
      lastName: 'x',
      mostRecentActiveBooking: false,
      sentenceDetail: {},
    },
    {
      bookingId: '2',
      offenderNo: 'A1234CD',
      firstName: 'x',
      lastName: 'x',
      mostRecentActiveBooking: true,
      sentenceDetail: {},
    },
    {
      bookingId: '3',
      offenderNo: 'A1234DC',
      firstName: 'x',
      lastName: 'x',
      mostRecentActiveBooking: false,
      sentenceDetail: {},
    },
  ]
  const staffDetails: StaffDetails = {
    code: 'N02A008',
    staffId: 1,
    name: { forenames: 'x', surname: 'x' },
    teams: [],
  }

  beforeEach(() => {
    nomisClient = {
      getOffenderSentencesByNomisId: jest.fn().mockResolvedValue([]),
      getBooking: jest.fn().mockReturnValue({ offenderNo: 1 }),
    }

    const nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)

    deliusClient = new DeliusClient(undefined) as jest.Mocked<DeliusClient>
    deliusClient.getManagedPrisonerIdsByStaffId.mockResolvedValue(roPrisoners)
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
      deliusClient.getManagedPrisonerIdsByStaffId.mockResolvedValue(roPrisoners)
      await service.getROPrisonersForStaffIdentifier(123, 'token')
      expect(deliusClient.getManagedPrisonerIdsByStaffId).toHaveBeenCalled()
      expect(nomisClient.getOffenderSentencesByNomisId).toHaveBeenCalled()
      expect(nomisClient.getOffenderSentencesByNomisId).toHaveBeenCalledWith(['A', 'B', 'C'])
    })

    test('should return only most recent active booking from getOffenderSentencesByNomisId', async () => {
      deliusClient.getManagedPrisonerIdsByStaffId.mockResolvedValue(roPrisoners)
      nomisClient.getOffenderSentencesByNomisId.mockResolvedValue(offenderSentences)
      const result = await service.getROPrisonersForStaffIdentifier(123, 'token')
      expect(deliusClient.getManagedPrisonerIdsByStaffId).toHaveBeenCalled()
      expect(nomisClient.getOffenderSentencesByNomisId).toHaveBeenCalled()
      expect(nomisClient.getOffenderSentencesByNomisId).toHaveBeenCalledWith(['A', 'B', 'C'])
      expect(result).toStrictEqual([
        {
          bookingId: '2',
          offenderNo: 'A1234CD',
          firstName: 'x',
          lastName: 'x',
          mostRecentActiveBooking: true,
          sentenceDetail: {},
        },
      ])
    })

    test('should not call getOffenderSentencesByNomisId when no results from getROPrisoners', async () => {
      deliusClient.getManagedPrisonerIdsByStaffId.mockResolvedValue([])
      await service.getROPrisonersForStaffIdentifier(123, 'token')
      expect(deliusClient.getManagedPrisonerIdsByStaffId).toHaveBeenCalled()
      expect(nomisClient.getOffenderSentencesByNomisId).toHaveBeenCalled()
    })

    test('should return empty array and explanation message if no eligible releases found', async () => {
      deliusClient.getManagedPrisonerIdsByStaffId.mockResolvedValue([])
      const result = await service.getROPrisonersForStaffIdentifier(123, 'token')
      expect(result).toEqual([])
    })

    test('should return empty array when staff member not found in delius', async () => {
      deliusClient.getManagedPrisonerIdsByStaffId.mockResolvedValue(undefined)
      const result = await service.getROPrisonersForStaffIdentifier(123, 'token')
      expect(result).toEqual(null)
    })
  })

  describe('findResponsibleOfficer', () => {
    test('should call the api with the offenderNo', async () => {
      deliusClient.getCommunityManager.mockResolvedValue(null)

      await service.findResponsibleOfficer('123', 'token')

      expect(nomisClient.getBooking).toHaveBeenCalled()
      expect(nomisClient.getBooking).toHaveBeenCalledWith('123')

      expect(deliusClient.getCommunityManager).toHaveBeenCalled()
      expect(deliusClient.getCommunityManager).toHaveBeenCalledWith(1)
    })

    test('should return the found COM', () => {
      deliusClient.getCommunityManager.mockResolvedValue({
        code: 'CODE-1',
        staffId: 1,
        name: { forenames: 'Jo', surname: 'Smith' },
        team: { code: 'TEAM_1', description: 'The Team' },
        provider: { code: 'PROB-1', description: 'PROB-1 Description' },
        localAdminUnit: { code: 'LDU-1', description: 'LDU-1 Description' },
        isUnallocated: false,
      })

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

    test('should throw if error in api when getting ro', () => {
      deliusClient.getCommunityManager.mockRejectedValue(new Error('dead'))
      return expect(service.findResponsibleOfficer('123', 'token')).rejects.toEqual(Error('dead'))
    })

    test('should return message when 404 in api when getting RO relationship', () => {
      deliusClient.getCommunityManager.mockResolvedValue(undefined)
      return expect(service.findResponsibleOfficer('123', 'token')).resolves.toEqual({
        code: 'NO_OFFENDER_NUMBER',
        message: 'Offender number not entered in delius',
      })
    })
  })
})
