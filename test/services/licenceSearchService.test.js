const createLicenceSearchService = require('../../server/services/licenceSearchService')

let licenceSearchService
let licenceClient
let signInService
let nomisClient
let nomisClientBuilder
let prisonerSearchAPI
let restClientBuilder

describe('licenceSearchService', () => {
  beforeEach(async () => {
    licenceClient = {
      getLicence: jest.fn(),
      getLicencesInStage: jest.fn().mockReturnValue([
        { booking_id: 1, transition_date: '01-01-2020' },
        { booking_id: 2, transition_date: '01-01-2020' },
        { booking_id: 3, transition_date: '01-01-2020' },
      ]),
    }

    signInService = {
      getClientCredentialsTokens: jest.fn().mockReturnValue('a token'),
    }

    nomisClient = {
      getBookingByOffenderNumber: jest.fn().mockReturnValue({ bookingId: 1 }),
    }

    prisonerSearchAPI = {
      getPrisoners: jest.fn().mockReturnValue([
        {
          bookingId: '1',
          prisonerNumber: 'AAAA11',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: '01-01-2021',
        },
        {
          bookingId: '2',
          prisonerNumber: 'AAAA12',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: '01-01-2021',
        },
        {
          bookingId: '3',
          prisonerNumber: 'AAAA13',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: '01-01-2021',
        },
      ]),
    }

    nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)
    restClientBuilder = jest.fn().mockReturnValue(prisonerSearchAPI)
    licenceSearchService = await createLicenceSearchService(
      licenceClient,
      signInService,
      nomisClientBuilder,
      restClientBuilder
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('findLicenceFor', () => {
    it('Should find when searching by booking id', async () => {
      licenceClient.getLicence.mockReturnValue({ booking_id: 1234 })

      const bookingId = await licenceSearchService.findForId('user-1', '1234')

      expect(bookingId).toBe(1234)
    })

    it('Should trim input when searching by booking id', async () => {
      licenceClient.getLicence.mockReturnValue({ booking_id: 1234 })

      const bookingId = await licenceSearchService.findForId('user-1', '  1234   ')

      expect(bookingId).toBe(1234)
    })

    it('Should find when searching by offender number', async () => {
      nomisClient.getBookingByOffenderNumber.mockReturnValue({ bookingId: 1234 })
      licenceClient.getLicence.mockReturnValueOnce({ booking_id: 1234 })

      const bookingId = await licenceSearchService.findForId('user-1', 'ABC1234')

      expect(bookingId).toBe(1234)
      expect(signInService.getClientCredentialsTokens).toHaveBeenCalledWith('user-1')
      expect(nomisClient.getBookingByOffenderNumber).toHaveBeenCalledWith('ABC1234')
    })

    it('Can cope with 404 when searching by offender number', async () => {
      licenceClient.getLicence.mockReturnValue(null)
      nomisClient.getBookingByOffenderNumber.mockRejectedValue({ status: 404 })

      const bookingId = await licenceSearchService.findForId('user-1', 'ABC1234')

      expect(bookingId).toBe(null)
      expect(signInService.getClientCredentialsTokens).toHaveBeenCalledWith('user-1')
      expect(nomisClient.getBookingByOffenderNumber).toHaveBeenCalledWith('ABC1234')
    })

    it('propagates other http errors when searching by offender number', async () => {
      licenceClient.getLicence.mockReturnValue(null)
      nomisClient.getBookingByOffenderNumber.mockRejectedValue({ status: 500 })

      return expect(licenceSearchService.findForId('user-1', 'ABC1234')).rejects.toStrictEqual({ status: 500 })
    })
  })

  describe('getLicencesInStageCOM', () => {
    test('should request licence and prisoner details from client', async () => {
      await licenceSearchService.getLicencesInStageCOM('user-1')

      expect(licenceClient.getLicencesInStage).toHaveBeenCalledWith('PROCESSING_RO', 'a token')
      expect(prisonerSearchAPI.getPrisoners).toHaveBeenCalledWith([1, 2, 3])
    })

    test('should decorate licences with prisoner details and return csv string', async () => {
      const result = await licenceSearchService.getLicencesInStageCOM('user-1')

      expect(result).toContain(
        'PRISON_NUMBER,PRISON_ID,PRISON_NAME,HANDOVER_DATE,HDCED\nAAAA11,MDI,Moorland (HMP & YOI),01-01-2020,01-01-2021\nAAAA12,MDI,Moorland (HMP & YOI),01-01-2020,01-01-2021\nAAAA13,MDI,Moorland (HMP & YOI),01-01-2020,01-01-2021'
      )
    })

    test('should not add released prisoners to csv string', async () => {
      prisonerSearchAPI.getPrisoners.mockReturnValue([
        {
          bookingId: '1',
          prisonerNumber: 'AAAA11',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: '01-01-2021',
        },
        {
          bookingId: '2',
          prisonerNumber: 'AAAA12',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: '01-01-2021',
        },
        {
          bookingId: '3',
          prisonerNumber: 'AAAA13',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: '01-01-2021',
          status: 'INACTIVE OUT',
        },
      ])
      const result = await licenceSearchService.getLicencesInStageCOM('user-1')

      expect(result).toContain(
        'PRISON_NUMBER,PRISON_ID,PRISON_NAME,HANDOVER_DATE,HDCED\nAAAA11,MDI,Moorland (HMP & YOI),01-01-2020,01-01-2021\nAAAA12,MDI,Moorland (HMP & YOI),01-01-2020,01-01-2021'
      )
      expect(result).not.toContain('AAAA13,MDI,Moorland (HMP & YOI),01-01-2020,01-01-2021')
    })
  })
})
