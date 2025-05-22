import { createPrisonerService } from '../../server/services/prisonerService'
import { RoService } from '../../server/services/roService'

jest.mock('../../server/services/roService')

describe('prisonerDetailsService', () => {
  let nomisClientMock
  let roService
  let service

  const hdcPrisonersResponse = [{ bookingId: 1, facialImageId: 2, agencyLocationId: 'ABC', middleName: 'Middle' }]
  const identifiersResponse = [
    { type: 'PNC', value: 'PNC001' },
    { type: 'CRO', value: 'CRO001' },
  ]
  const aliasesResponse = [
    { firstName: 'ALIAS', lastName: 'One' },
    { firstName: 'AKA', lastName: 'Two' },
  ]
  const mainOffenceResponse = [{ offenceDescription: 'Robbery, conspiracy to rob' }]
  const imageInfoResponse = { imageId: 'imgId', captureDate: '1971-11-23' }
  const imageDataResponse = Buffer.from('image')
  const establishmentResponse = { agencyId: 'AGY-1', premise: 'HMP Licence Test Prison' }
  const prisonerInfoResponse = {
    bookingId: 1,
    facialImageId: 2,
    imageId: 'imgId',
    captureDate: '23/11/1971',
    aliases: 'Alias One, Aka Two',
    offences: 'Robbery, conspiracy to rob',
    com: {
      deliusId: 'delius1',
      staffIdentifier: 1,
      name: 'Comfirst Comlast',
      nomsNumber: undefined,
      teamCode: undefined,
      teamDescription: undefined,
      lduCode: undefined,
      lduDescription: undefined,
      probationAreaCode: undefined,
      probationAreaDescription: undefined,
      isAllocated: undefined,
    },
    agencyLocationId: 'ABC',
    CRO: 'CRO001',
    PNC: 'PNC001',
    middleName: 'Middle',
  }
  const recentMovementsResponse = [{ movementType: 'REL', fromAgency: 'RELEASING AGENCY' }]
  const responsibleOfficerResponse = Promise.resolve({
    deliusId: 'delius1',
    staffIdentifier: 1,
    name: 'Comfirst Comlast',
    nomsNumber: undefined,
    teamCode: undefined,
    teamDescription: undefined,
    lduCode: undefined,
    lduDescription: undefined,
    probationAreaCode: undefined,
    probationAreaDescription: undefined,
    isAllocated: undefined,
  })

  beforeEach(() => {
    nomisClientMock = {
      getOffenderSentencesByBookingId: jest.fn().mockReturnValue(hdcPrisonersResponse),
      getIdentifiers: jest.fn().mockReturnValue(identifiersResponse),
      getAliases: jest.fn().mockReturnValue(aliasesResponse),
      getMainOffence: jest.fn().mockReturnValue(mainOffenceResponse),
      getImageInfo: jest.fn().mockReturnValue(imageInfoResponse),
      getImageData: jest.fn().mockReturnValue(imageDataResponse),
      getEstablishment: jest.fn().mockReturnValue(establishmentResponse),
      getRecentMovements: jest.fn().mockReturnValue(recentMovementsResponse),
    }
    const nomisClientBuilder = jest.fn().mockReturnValue(nomisClientMock)
    roService = new RoService(undefined, undefined)
    roService.findResponsibleOfficer.mockReturnValue(responsibleOfficerResponse)
    const signInService = {
      getClientCredentialsTokens: jest.fn().mockResolvedValue('systemToken'),
    }

    service = createPrisonerService(nomisClientBuilder, roService, signInService)
  })

  describe('getPrisonerDetails', () => {
    test('should call the api with the booking id', async () => {
      await service.getPrisonerDetails(1, 'username')

      expect(nomisClientMock.getOffenderSentencesByBookingId).toHaveBeenCalled()
      expect(nomisClientMock.getAliases).toHaveBeenCalled()
      expect(nomisClientMock.getMainOffence).toHaveBeenCalled()
      expect(nomisClientMock.getImageInfo).toHaveBeenCalled()
      expect(nomisClientMock.getIdentifiers).toHaveBeenCalled()
      expect(roService.findResponsibleOfficer).toHaveBeenCalled()

      expect(nomisClientMock.getOffenderSentencesByBookingId).toHaveBeenCalledWith(1)
      expect(nomisClientMock.getAliases).toHaveBeenCalledWith(1)
      expect(nomisClientMock.getMainOffence).toHaveBeenCalledWith(1)
      expect(nomisClientMock.getImageInfo).toHaveBeenCalledWith(2)
      expect(nomisClientMock.getIdentifiers).toHaveBeenCalledWith(1)
      expect(roService.findResponsibleOfficer).toHaveBeenCalledWith(1, 'username')
    })

    test('should return the result of the api call', () => {
      return expect(service.getPrisonerDetails('123', 'username')).resolves.toEqual(prisonerInfoResponse)
    })

    test('should return the only selected identifiers', () => {
      const identifiersResponseWithOthers = [
        { type: 'PNC', value: 'PNC001' },
        { type: 'IGNORE', value: 'IGNORE001' },
        { type: 'CRO', value: 'CRO001' },
      ]

      nomisClientMock.getIdentifiers.mockResolvedValue(identifiersResponseWithOthers)

      return expect(service.getPrisonerDetails('123', 'username')).resolves.toEqual(prisonerInfoResponse)
    })

    test('should throw if error in api', () => {
      nomisClientMock.getOffenderSentencesByBookingId.mockRejectedValue(new Error('Error'))

      return expect(service.getPrisonerDetails('123', 'username')).rejects.toEqual(Error('Error'))
    })

    test('it should return false for imageId of no image', async () => {
      const prisonerResponse2 = [{ bookingId: 1, facialImageId: null }]

      nomisClientMock.getOffenderSentencesByBookingId.mockResolvedValue(prisonerResponse2)

      const result = await service.getPrisonerDetails('123', 'username')
      return expect(result.imageId).toBe(false)
    })
  })

  describe('getPrisonerImage', () => {
    test('should call getImageData with the imageId', async () => {
      await service.getPrisonerImage('123', 'username')

      expect(nomisClientMock.getImageData).toHaveBeenCalled()
      expect(nomisClientMock.getImageData).toHaveBeenCalledWith('123')
    })

    test('should return the image', () => {
      expect(service.getPrisonerImage('123', 'username')).toEqual(imageDataResponse)
    })
  })

  describe('getEstablishmentForPrisoner', () => {
    test('should call the api with the nomis id', async () => {
      nomisClientMock.getOffenderSentencesByBookingId.mockResolvedValue(hdcPrisonersResponse)

      await service.getEstablishmentForPrisoner('123', 'username')

      expect(nomisClientMock.getOffenderSentencesByBookingId).toHaveBeenCalled()
      expect(nomisClientMock.getEstablishment).toHaveBeenCalled()
      expect(nomisClientMock.getOffenderSentencesByBookingId).toHaveBeenCalledWith('123')
      expect(nomisClientMock.getEstablishment).toHaveBeenCalledWith('ABC')
    })

    test('should return the result of the api call', () => {
      return expect(service.getEstablishmentForPrisoner('123', 'username')).resolves.toEqual(establishmentResponse)
    })

    test('should throw if error in api when getting offender', () => {
      nomisClientMock.getOffenderSentencesByBookingId.mockRejectedValue(new Error('Error'))
      return expect(service.getEstablishmentForPrisoner('123', 'username')).rejects.toEqual(Error('Error'))
    })

    test('should throw if error in api when getting establishment', () => {
      nomisClientMock.getOffenderSentencesByBookingId.mockResolvedValue(hdcPrisonersResponse)
      nomisClientMock.getEstablishment.mockRejectedValue(new Error('Error'))
      return expect(service.getEstablishmentForPrisoner('123', 'username')).rejects.toEqual(Error('Error'))
    })

    test('should NOT throw but return null if 404 in api when getting establishment', () => {
      nomisClientMock.getOffenderSentencesByBookingId.mockResolvedValue(hdcPrisonersResponse)
      nomisClientMock.getEstablishment.mockRejectedValue({ status: 404 })
      return expect(service.getEstablishmentForPrisoner('123', 'username')).resolves.toEqual(null)
    })

    test('should throw if error in api when getting establishment if error ststus other than 404', () => {
      nomisClientMock.getOffenderSentencesByBookingId.mockResolvedValue(hdcPrisonersResponse)
      nomisClientMock.getEstablishment.mockRejectedValue({ status: 401 })
      return expect(service.getEstablishmentForPrisoner('123', 'username')).rejects.toEqual({ status: 401 })
    })

    test('should get latest movement if prisoner is out', async () => {
      nomisClientMock.getOffenderSentencesByBookingId.mockResolvedValue([
        { bookingId: 1, facialImageId: 2, agencyLocationId: 'OUT', middleName: 'Middle' },
      ])

      await service.getEstablishmentForPrisoner('123', 'token')
      expect(nomisClientMock.getRecentMovements).toHaveBeenCalled()
      expect(nomisClientMock.getEstablishment).toHaveBeenCalledWith('RELEASING AGENCY')
    })
  })

  describe('getOrganisationContactDetails', () => {
    test('should get COM for RO', async () => {
      await service.getOrganisationContactDetails('RO', '123', 'token')
      expect(nomisClientMock.getEstablishment).not.toHaveBeenCalled()
      expect(roService.findResponsibleOfficer).toHaveBeenCalled()
    })

    test('should get establishment for CA', async () => {
      await service.getOrganisationContactDetails('CA', '123', 'token')
      expect(nomisClientMock.getEstablishment).toHaveBeenCalled()
      expect(roService.findResponsibleOfficer).not.toHaveBeenCalled()
    })

    test('should not call anything for DM', async () => {
      await service.getOrganisationContactDetails('DM', '123', 'token')
      expect(nomisClientMock.getEstablishment).toHaveBeenCalled()
      expect(roService.findResponsibleOfficer).not.toHaveBeenCalled()
    })
  })

  describe('getDestinations', () => {
    const responsibleOfficer = {
      deliusId: 'delius1',
      probationAreaCode: 'Test Area',
      lduCode: 'Test Unit',
      name: 'Comfirst Comlast',
      message: null,
    }

    beforeEach(() => {
      roService.findResponsibleOfficer.mockReturnValue(responsibleOfficer)
    })

    test('for CA -> RO', async () => {
      const destinations = await service.getDestinations('CA', 'RO', '123', 'token')
      expect(destinations).toStrictEqual({
        submissionTarget: responsibleOfficer,
        source: {
          agencyId: 'AGY-1',
          type: 'prison',
        },

        target: {
          lduCode: 'Test Unit',
          probationAreaCode: 'Test Area',
          type: 'probation',
        },
      })
    })

    test('for RO -> CA', async () => {
      const destinations = await service.getDestinations('RO', 'CA', '123', 'token')
      expect(destinations).toStrictEqual({
        submissionTarget: establishmentResponse,
        source: {
          lduCode: 'Test Unit',
          probationAreaCode: 'Test Area',
          type: 'probation',
        },
        target: {
          agencyId: 'AGY-1',
          type: 'prison',
        },
      })
    })

    test('for CA -> DM', async () => {
      const destinations = await service.getDestinations('CA', 'DM', '123', 'token')
      expect(destinations).toStrictEqual({
        submissionTarget: establishmentResponse,
        source: {
          agencyId: 'AGY-1',
          type: 'prison',
        },
        target: {
          agencyId: 'AGY-1',
          type: 'prison',
        },
      })
    })
  })

  test('for DM -> CA', async () => {
    const destinations = await service.getDestinations('DM', 'CA', '123', 'token')
    expect(destinations).toStrictEqual({
      submissionTarget: establishmentResponse,
      source: {
        agencyId: 'AGY-1',
        type: 'prison',
      },
      target: {
        agencyId: 'AGY-1',
        type: 'prison',
      },
    })
  })
})
