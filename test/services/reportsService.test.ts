import moment from 'moment'
import { ReportsService } from '../../server/services/reportsService'

jest.mock('../../server/data/licenceClient')

describe('reportsService', () => {
  let service: ReportsService
  let licenceClient
  let signInService
  let prisonerSearchAPI
  let probationSearchApi
  let restPrisonerClientBuilder
  let restProbationClientBuilder

  const hdcedWithin14Weeks = moment().add(14, 'weeks').subtract(1, 'days').format('DD-MM-YYYY')
  const hdced14Weeks = moment().add(14, 'weeks').format('DD-MM-YYYY')

  const licencesInStage = [
    { booking_id: 1, transition_date: '01-01-2020' },
    { booking_id: 2, transition_date: '01-01-2020' },
    { booking_id: 3, transition_date: '01-01-2020' },
  ]

  const licencesInStageWithAddressOrCasLocation = [
    { booking_id: 1 },
    { booking_id: 2 },
    { booking_id: 3 },
    { booking_id: 4 },
    { booking_id: 5 },
    { booking_id: 6 },
    { booking_id: 7 },
  ]

  const prisoners = [
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
  ]

  const probationDetails = [
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
        nomsNumber: 'AAAA15',
      },
      offenderManagers: [
        {
          active: true,
          probationArea: {
            description: 'North of England',
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
  ]

  beforeEach(async () => {
    licenceClient = {
      getLicence: jest.fn(),
      getLicenceIncludingSoftDeleted: jest.fn(),
      getLicencesInStage: jest.fn().mockReturnValue(licencesInStage),
      getLicencesInStageWithAddressOrCasLocation: jest.fn().mockReturnValue(licencesInStageWithAddressOrCasLocation),
    }

    signInService = {
      getClientCredentialsTokens: jest.fn().mockReturnValue('a token'),
    }

    prisonerSearchAPI = {
      getPrisoners: jest.fn().mockReturnValue(prisoners),
    }

    probationSearchApi = {
      getPersonProbationDetails: jest.fn().mockReturnValue(probationDetails),
    }

    restPrisonerClientBuilder = jest.fn().mockReturnValue(prisonerSearchAPI)
    restProbationClientBuilder = jest.fn().mockReturnValue(probationSearchApi)
    service = new ReportsService(licenceClient, signInService, restPrisonerClientBuilder, restProbationClientBuilder)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getLicencesInStageCOM', () => {
    test('should request licence and prisoner details from client', async () => {
      await service.getLicencesInStageCOM('user-1')

      expect(licenceClient.getLicencesInStage).toHaveBeenCalledWith('PROCESSING_RO')
      expect(prisonerSearchAPI.getPrisoners).toHaveBeenCalledWith([1, 2, 3])
    })

    test('should decorate licences with prisoner details and return csv string', async () => {
      const result = await service.getLicencesInStageCOM('user-1')

      expect(result).toContain(
        `PRISON_NUMBER,PRISON_ID,PRISON_NAME,HANDOVER_DATE,HDCED\nAAAA11,MDI,Moorland (HMP & YOI),01-01-2020,${hdcedWithin14Weeks}\nAAAA12,MDI,Moorland (HMP & YOI),01-01-2020,${hdcedWithin14Weeks}\nAAAA13,MDI,Moorland (HMP & YOI),01-01-2020,${hdcedWithin14Weeks}`
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
      const result = await service.getLicencesInStageCOM('user-1')

      expect(result).toContain(
        `PRISON_NUMBER,PRISON_ID,PRISON_NAME,HANDOVER_DATE,HDCED\nAAAA11,MDI,Moorland (HMP & YOI),01-01-2020,${hdcedWithin14Weeks}\nAAAA12,MDI,Moorland (HMP & YOI),01-01-2020,${hdcedWithin14Weeks}`
      )
      expect(result).not.toContain(`AAAA13,MDI,Moorland (HMP & YOI),01-01-2020,${hdcedWithin14Weeks}`)
    })
  })

  describe('getComAssignedLicencesForHandover', () => {
    test('should request licence, prisoner and probation details from client', async () => {
      await service.getComAssignedLicencesForHandover('user-1', 'MDI')

      expect(licenceClient.getLicencesInStageWithAddressOrCasLocation).toHaveBeenCalledWith('ELIGIBILITY')
      expect(prisonerSearchAPI.getPrisoners).toHaveBeenCalledWith([1, 2, 3, 4, 5, 6, 7])
      expect(probationSearchApi.getPersonProbationDetails).toHaveBeenCalledWith([
        'AAAA11',
        'AAAA12',
        'AAAA13',
        'AAAA15',
        'AAAA17',
      ])
      // filter out prisoners in different prisons to CA and prisoners with an HDCED over 14 weeks away:
      expect(probationSearchApi.getPersonProbationDetails).not.toHaveBeenCalledWith(['AAAA14', 'AAAA16'])
    })

    test('should decorate licences with prisoner and probation details and return csv string', async () => {
      const result = await service.getComAssignedLicencesForHandover('user-1', 'MDI')

      expect(result).toContain(
        `PRISON_NUMBER,PRISONER_FIRSTNAME,PRISONER_LASTNAME,HDCED,PDU\nAAAA12,Max,Martin,${hdcedWithin14Weeks},West of England\nAAAA13,Tim,North,${hdcedWithin14Weeks},South of England\nAAAA15,Bob,Bobbington,${hdced14Weeks},North of England`
      )
      expect(result).not.toContain(`AAAA11,John,Smith,${hdcedWithin14Weeks},East of England`)
      expect(result).not.toContain(`AAAA17,Frank,Smith,${hdcedWithin14Weeks}`)
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
          status: 'INACTIVE OUT',
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
      ])
      const result = await service.getComAssignedLicencesForHandover('user-1', 'MDI')

      expect(result).toContain(
        `PRISON_NUMBER,PRISONER_FIRSTNAME,PRISONER_LASTNAME,HDCED,PDU\nAAAA13,Tim,North,${hdcedWithin14Weeks},South of England`
      )
      expect(result).not.toContain(`AAAA12,Max,Martin,${hdcedWithin14Weeks},West of England`)
    })
  })

  describe('getLicencesRequiringComAssignment', () => {
    test('should request licence, prisoner and probation details from client', async () => {
      await service.getLicencesRequiringComAssignment('user-1', 'MDI')

      expect(licenceClient.getLicencesInStageWithAddressOrCasLocation).toHaveBeenCalledWith('ELIGIBILITY')
      expect(prisonerSearchAPI.getPrisoners).toHaveBeenCalledWith([1, 2, 3, 4, 5, 6, 7])
      expect(probationSearchApi.getPersonProbationDetails).toHaveBeenCalledWith([
        'AAAA11',
        'AAAA12',
        'AAAA13',
        'AAAA15',
        'AAAA17',
      ])
      expect(probationSearchApi.getPersonProbationDetails).toHaveBeenCalledWith([
        'AAAA11',
        'AAAA12',
        'AAAA13',
        'AAAA15',
        'AAAA17',
      ])
      // filter out prisoners in different prisons to CA and prisoners with an HDCED over 14 weeks away:
      expect(probationSearchApi.getPersonProbationDetails).not.toHaveBeenCalledWith(['AAAA14', 'AAAA16'])
    })

    test('should decorate licences with prisoner and probation details and return csv string', async () => {
      const result = await service.getLicencesRequiringComAssignment('user-1', 'MDI')

      expect(result).toContain(
        `PRISON_NUMBER,PRISONER_FIRSTNAME,PRISONER_LASTNAME,HDCED,PDU\nAAAA11,John,Smith,${hdcedWithin14Weeks},East of England\nAAAA17,Frank,Smith,${hdcedWithin14Weeks},\n`
      )
      expect(result).not.toContain(`AAAA12,Max,Martin,${hdcedWithin14Weeks},West of England`)
      expect(result).not.toContain(`AAAA13,Tim,North,${hdcedWithin14Weeks},South of England`)
      expect(result).not.toContain(`AAAA15,Bob,Bobbington,${hdced14Weeks},North of England`)
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
      const result = await service.getLicencesRequiringComAssignment('user-1', 'MDI')

      expect(result).toContain('PRISON_NUMBER,PRISONER_FIRSTNAME,PRISONER_LASTNAME,HDCED,PDU')
      expect(result).not.toContain(`AAAA11,John,Smith,${hdcedWithin14Weeks},East of England`)
    })
  })

  describe('getComAssignedLicencesForHandover', () => {
    test('should request licence, prisoner and probation details from client', async () => {
      await service.getComAssignedLicencesForHandover('user-1', 'MDI')

      expect(licenceClient.getLicencesInStageWithAddressOrCasLocation).toHaveBeenCalledWith('ELIGIBILITY')
      expect(prisonerSearchAPI.getPrisoners).toHaveBeenCalledWith([1, 2, 3, 4, 5, 6, 7])
      expect(probationSearchApi.getPersonProbationDetails).toHaveBeenCalledWith([
        'AAAA11',
        'AAAA12',
        'AAAA13',
        'AAAA15',
        'AAAA17',
      ])
      // filter out prisoners in different prisons to CA and prisoners with an HDCED over 14 weeks away:
      expect(probationSearchApi.getPersonProbationDetails).not.toHaveBeenCalledWith(['AAAA14', 'AAAA16'])
    })

    test('should decorate licences with prisoner and probation details and return csv string', async () => {
      const result = await service.getComAssignedLicencesForHandover('user-1', 'MDI')

      expect(result).toContain(
        `PRISON_NUMBER,PRISONER_FIRSTNAME,PRISONER_LASTNAME,HDCED,PDU\nAAAA12,Max,Martin,${hdcedWithin14Weeks},West of England\nAAAA13,Tim,North,${hdcedWithin14Weeks},South of England\nAAAA15,Bob,Bobbington,${hdced14Weeks},North of England`
      )
      expect(result).not.toContain(`AAAA11,John,Smith,${hdcedWithin14Weeks},East of England`)
      expect(result).not.toContain(`AAAA17,Frank,Smith,${hdcedWithin14Weeks}`)
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
          status: 'INACTIVE OUT',
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
      ])
      const result = await service.getComAssignedLicencesForHandover('user-1', 'MDI')

      expect(result).toContain(
        `PRISON_NUMBER,PRISONER_FIRSTNAME,PRISONER_LASTNAME,HDCED,PDU\nAAAA13,Tim,North,${hdcedWithin14Weeks},South of England`
      )
      expect(result).not.toContain(`AAAA12,Max,Martin,${hdcedWithin14Weeks},West of England`)
    })
  })
})
