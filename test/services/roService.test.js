const createRoService = require('../../server/services/roService')

describe('roService', () => {
  let service
  let nomisClient
  let deliusClient

  const roResponse = [
    {
      forenames: 'COMFIRST',
      surname: 'comLast',
      staffCode: 'delius1',
      teamCode: 'TEAM_1',
      teamDescription: 'The Team',
      lduCode: 'code-1',
      lduDescription: 'lduDescription-1',
      nomsNumber: 'AAAA12',
      probationAreaCode: 'prob-code-1',
      probationAreaDescription: 'prob-desc-1',
    },
  ]

  const roPrisoners = [{ nomsNumber: 'A' }, { nomsNumber: 'B' }, { nomsNumber: 'C' }]

  beforeEach(() => {
    nomisClient = {
      getOffenderSentencesByNomisId: jest.fn().mockReturnValue([]),
      getBooking: jest.fn().mockReturnValue({ offenderNo: 1 }),
    }

    deliusClient = {
      getROPrisoners: jest.fn().mockReturnValue(roPrisoners),
      getResponsibleOfficer: jest.fn().mockReturnValue(roResponse),
      getStaffDetailsByStaffCode: jest.fn().mockReturnValue({ staffCode: 'N02A008' }),
      getStaffDetailsByUsername: jest.fn().mockReturnValue({ staffCode: 'N02A008' }),
      getAllOffenderManagers: jest.fn(),
    }

    const nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)

    service = createRoService(deliusClient, nomisClientBuilder)
  })

  describe('getStaffByCode', () => {
    test('should call getStaffByCode from deliusClient', async () => {
      await service.getStaffByCode('code-1')
      expect(deliusClient.getStaffDetailsByStaffCode).toHaveBeenCalledWith('code-1')
    })

    test('should return message when 404 in api when getting RO relationship', () => {
      deliusClient.getStaffDetailsByStaffCode.mockRejectedValue({ status: 404 })
      return expect(service.getStaffByCode('code-1')).resolves.toStrictEqual({
        code: 'STAFF_NOT_PRESENT',
        message: `Staff does not exist in delius: code-1`,
      })
    })
  })

  describe('getStaffByUsername', () => {
    test('should call getStaffByCode from deliusClient', async () => {
      await service.getStaffByUsername('code-1')
      expect(deliusClient.getStaffDetailsByUsername).toHaveBeenCalledWith('code-1')
    })

    test('should return message when 404 in api when getting RO relationship', () => {
      deliusClient.getStaffDetailsByUsername.mockRejectedValue({ status: 404 })
      return expect(service.getStaffByUsername('code-1')).resolves.toBe(null)
    })
  })

  describe('getROPrisoners', () => {
    test('should call getROPrisoners from deliusClient && getOffenderSentencesByNomisId from nomisClient', async () => {
      deliusClient.getROPrisoners.mockResolvedValue(roPrisoners)
      await service.getROPrisoners(123, 'token')
      expect(deliusClient.getROPrisoners).toHaveBeenCalled()
      expect(nomisClient.getOffenderSentencesByNomisId).toHaveBeenCalled()
      expect(nomisClient.getOffenderSentencesByNomisId).toHaveBeenCalledWith(['A', 'B', 'C'])
    })

    test('should not call getOffenderSentencesByBookingId when no results from getROPrisoners', async () => {
      deliusClient.getROPrisoners.mockResolvedValue([])
      await service.getROPrisoners(123, 'token')
      expect(deliusClient.getROPrisoners).toHaveBeenCalled()
      expect(nomisClient.getOffenderSentencesByNomisId).not.toHaveBeenCalled()
    })

    test('should return empty array and explanation message if no eligible releases found', async () => {
      deliusClient.getROPrisoners.mockResolvedValue([])
      const result = await service.getROPrisoners(123, 'token')
      expect(result).toEqual([])
    })

    test('should return empty array when staff member not found in delius', async () => {
      deliusClient.getROPrisoners.mockRejectedValue({ status: 404 })
      const result = await service.getROPrisoners(123, 'token')
      expect(result).toEqual([])
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
          isUnallocated: false,
          team: {
            localDeliveryUnit: { code: 'LDU-1', description: 'LDU-1 Description' },
            code: 'TEAM_1',
            description: 'The Team',
          },
          probationArea: { code: 'PROB-1', description: 'PROB-1 Description' },
        },
      ])

      const expectedComData = {
        deliusId: 'CODE-1',
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
      deliusClient.getAllOffenderManagers.mockResolvedValue([{ isPrisonOffenderManager: true }])

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

    test('should throw if error in api when getting relationships if error status other than 404', () => {
      deliusClient.getAllOffenderManagers.mockRejectedValue({ status: 401 })
      return expect(service.findResponsibleOfficer('123', 'token')).rejects.toEqual({ status: 401 })
    })

    test('should return message when 404 in api when getting RO relationship', () => {
      deliusClient.getAllOffenderManagers.mockRejectedValue({ status: 404 })
      return expect(service.findResponsibleOfficer('123', 'token')).resolves.toEqual({
        code: 'NO_OFFENDER_NUMBER',
        message: 'Offender number not entered in delius',
      })
    })
  })
})
