const moment = require('moment')
const createLicenceSearchService = require('../../server/services/licenceSearchService')

let licenceSearchService
let licenceClient
let signInService
let nomisClient
let nomisClientBuilder
let prisonerSearchAPI
let probationSearchApi
let restPrisonerClientBuilder
let restProbationClientBuilder
const hdced = moment().add(14, 'weeks').subtract(1, 'days').format('DD-MM-YYYY')

describe('licenceSearchService', () => {
  beforeEach(async () => {
    licenceClient = {
      getLicence: jest.fn(),
      getLicenceIncludingSoftDeleted: jest.fn(),
      getLicencesInStage: jest.fn().mockReturnValue([
        { booking_id: 1, transition_date: '01-01-2020' },
        { booking_id: 2, transition_date: '01-01-2020' },
        { booking_id: 3, transition_date: '01-01-2020' },
      ]),
      getLicencesInStageWithAddressOrCasLocation: jest
        .fn()
        .mockReturnValue([
          { booking_id: 1 },
          { booking_id: 2 },
          { booking_id: 3 },
          { booking_id: 4 },
          { booking_id: 5 },
          { booking_id: 6 },
          { booking_id: 7 },
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
          firstName: 'John',
          lastName: 'Smith',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: moment().add(14, 'weeks').subtract(1, 'days'),
        },
        {
          bookingId: '2',
          prisonerNumber: 'AAAA12',
          firstName: 'Max',
          lastName: 'Martin',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: moment().add(14, 'weeks').subtract(1, 'days'),
        },
        {
          bookingId: '3',
          prisonerNumber: 'AAAA13',
          firstName: 'Tim',
          lastName: 'North',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: moment().add(14, 'weeks').subtract(1, 'days'),
        },
        {
          bookingId: '4',
          prisonerNumber: 'AAAA14',
          firstName: 'Sam',
          lastName: 'Samuels',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: moment().add(14, 'weeks').add(1, 'days'),
        },
        {
          bookingId: '5',
          prisonerNumber: 'AAAA15',
          firstName: 'Bob',
          lastName: 'Bobbington',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: moment().add(14, 'weeks'),
        },
        {
          bookingId: '6',
          prisonerNumber: 'AAAA16',
          firstName: 'Tom',
          lastName: 'Tommington',
          prisonId: 'SWI',
          prisonName: 'Swansea HMP',
          homeDetentionCurfewEligibilityDate: moment().add(14, 'weeks').subtract(1, 'days'),
        },
        {
          bookingId: '7',
          prisonerNumber: 'AAAA17',
          firstName: 'Frank',
          lastName: 'Smith',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: moment().add(14, 'weeks').subtract(1, 'days'),
        },
      ]),
    }

    probationSearchApi = {
      getPersonProbationDetails: jest.fn().mockReturnValue([
        {
          otherIds: {
            nomsNumber: 'AAAA11',
          },
          offenderManagers: [
            {
              active: true,
              probationArea: {
                description: 'East of England',
              },
              staff: {
                code: 'XXXXU',
                unallocated: true,
              },
            },
          ],
        },
        {
          otherIds: {
            nomsNumber: 'AAAA12',
          },
          offenderManagers: [
            {
              active: true,
              probationArea: {
                description: 'West of England',
              },
              staff: {
                code: 'XXXXX',
                unallocated: false,
              },
            },
          ],
        },
        {
          otherIds: {
            nomsNumber: 'AAAA13',
          },
          offenderManagers: [
            {
              active: true,
              probationArea: {
                description: 'South of England',
              },
              staff: {
                code: 'XXXXX',
              },
            },
          ],
        },
        {
          otherIds: {
            nomsNumber: 'AAAA17',
          },
          offenderManagers: [
            {
              active: true,
              probationArea: {},
              staff: {
                code: 'XXXXU',
                unallocated: true,
              },
            },
          ],
        },
      ]),
    }

    nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)
    restPrisonerClientBuilder = jest.fn().mockReturnValue(prisonerSearchAPI)
    restProbationClientBuilder = jest.fn().mockReturnValue(probationSearchApi)
    licenceSearchService = await createLicenceSearchService(
      licenceClient,
      signInService,
      nomisClientBuilder,
      restPrisonerClientBuilder,
      restProbationClientBuilder
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('findLicenceFor', () => {
    it('Should find when searching by booking id', async () => {
      licenceClient.getLicenceIncludingSoftDeleted.mockReturnValue({ booking_id: 1234 })

      const bookingId = await licenceSearchService.findForId('user-1', '1234')

      expect(bookingId).toBe(1234)
    })

    it('Should trim input when searching by booking id', async () => {
      licenceClient.getLicenceIncludingSoftDeleted.mockReturnValue({ booking_id: 1234 })

      const bookingId = await licenceSearchService.findForId('user-1', '  1234   ')

      expect(bookingId).toBe(1234)
    })

    it('Should find when searching by offender number', async () => {
      nomisClient.getBookingByOffenderNumber.mockReturnValue({ bookingId: 1234 })
      licenceClient.getLicenceIncludingSoftDeleted.mockReturnValueOnce({ booking_id: 1234 })

      const bookingId = await licenceSearchService.findForId('user-1', 'ABC1234')

      expect(bookingId).toBe(1234)
      expect(signInService.getClientCredentialsTokens).toHaveBeenCalledWith('user-1')
      expect(nomisClient.getBookingByOffenderNumber).toHaveBeenCalledWith('ABC1234')
    })

    it('Can cope with 404 when searching by offender number', async () => {
      licenceClient.getLicenceIncludingSoftDeleted.mockReturnValue(null)
      nomisClient.getBookingByOffenderNumber.mockRejectedValue({ status: 404 })

      const bookingId = await licenceSearchService.findForId('user-1', 'ABC1234')

      expect(bookingId).toBe(null)
      expect(signInService.getClientCredentialsTokens).toHaveBeenCalledWith('user-1')
      expect(nomisClient.getBookingByOffenderNumber).toHaveBeenCalledWith('ABC1234')
    })

    it('propagates other http errors when searching by offender number', async () => {
      licenceClient.getLicenceIncludingSoftDeleted.mockReturnValue(null)
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
        `PRISON_NUMBER,PRISON_ID,PRISON_NAME,HANDOVER_DATE,HDCED\nAAAA11,MDI,Moorland (HMP & YOI),01-01-2020,${hdced}\nAAAA12,MDI,Moorland (HMP & YOI),01-01-2020,${hdced}\nAAAA13,MDI,Moorland (HMP & YOI),01-01-2020,${hdced}`
      )
    })

    test('should not add released prisoners to csv string', async () => {
      prisonerSearchAPI.getPrisoners.mockReturnValue([
        {
          bookingId: '1',
          prisonerNumber: 'AAAA11',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: moment().add(14, 'weeks').subtract(1, 'days'),
        },
        {
          bookingId: '2',
          prisonerNumber: 'AAAA12',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: moment().add(14, 'weeks').subtract(1, 'days'),
        },
        {
          bookingId: '3',
          prisonerNumber: 'AAAA13',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: moment().add(14, 'weeks').subtract(1, 'days'),
          status: 'INACTIVE OUT',
        },
      ])
      const result = await licenceSearchService.getLicencesInStageCOM('user-1')

      expect(result).toContain(
        `PRISON_NUMBER,PRISON_ID,PRISON_NAME,HANDOVER_DATE,HDCED\nAAAA11,MDI,Moorland (HMP & YOI),01-01-2020,${hdced}\nAAAA12,MDI,Moorland (HMP & YOI),01-01-2020,${hdced}`
      )
      expect(result).not.toContain(`AAAA13,MDI,Moorland (HMP & YOI),01-01-2020,${hdced}`)
    })
  })

  describe('getLicencesRequiringComAssignment', () => {
    test('should request licence, prisoner and probation details from client', async () => {
      await licenceSearchService.getLicencesRequiringComAssignment('user-1', 'MDI')

      expect(licenceClient.getLicencesInStageWithAddressOrCasLocation).toHaveBeenCalledWith('ELIGIBILITY', 'a token')
      expect(prisonerSearchAPI.getPrisoners).toHaveBeenCalledWith([1, 2, 3, 4, 5, 6, 7])
      expect(probationSearchApi.getPersonProbationDetails).toHaveBeenCalledWith([
        'AAAA11',
        'AAAA12',
        'AAAA13',
        'AAAA15',
        'AAAA17',
      ])
    })

    test('should decorate licences with prisoner and probation details and return csv string', async () => {
      const result = await licenceSearchService.getLicencesRequiringComAssignment('user-1', 'MDI')

      expect(result).toContain(
        `PRISON_NUMBER,PRISONER_FIRSTNAME,PRISONER_LASTNAME,HDCED,PDU\nAAAA11,John,Smith,${hdced},East of England\nAAAA17,Frank,Smith,${hdced},\n`
      )
      expect(result).not.toContain(`AAAA12,Max,Martin,${hdced},West of England`)
      expect(result).not.toContain(`AAAA13,Tim,North,${hdced},South of England`)
      expect(result).not.toContain(`AAAA15,Bob,Bobbington,${hdced},West of England`)
    })

    test('should not add released prisoners to csv string', async () => {
      prisonerSearchAPI.getPrisoners.mockReturnValue([
        {
          bookingId: '1',
          prisonerNumber: 'AAAA11',
          firstName: 'John',
          lastName: 'Smith',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: moment().add(13, 'weeks').format('YYYY-MM-DD'),
          status: 'INACTIVE OUT',
        },
        {
          bookingId: '2',
          prisonerNumber: 'AAAA12',
          firstName: 'Max',
          lastName: 'Martin',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: moment().add(13, 'weeks').format('YYYY-MM-DD'),
        },
        {
          bookingId: '3',
          prisonerNumber: 'AAAA13',
          firstName: 'Tim',
          lastName: 'North',
          prisonId: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
          homeDetentionCurfewEligibilityDate: moment().add(13, 'weeks').format('YYYY-MM-DD'),
        },
      ])
      const result = await licenceSearchService.getLicencesRequiringComAssignment('user-1', 'MDI')

      expect(result).toContain('PRISON_NUMBER,PRISONER_FIRSTNAME,PRISONER_LASTNAME,HDCED,PDU')
      expect(result).not.toContain(`AAAA11,John,Smith,${hdced},East of England`)
    })
  })
})
