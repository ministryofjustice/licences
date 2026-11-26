import LicenceSearchService from '../../server/services/licenceSearchService'
import { LicenceClient } from '../../server/data/licenceClient'
import SignInService from '../../server/authentication/signInService'

jest.mock('../../server/data/licenceClient')
jest.mock('../../server/authentication/signInService')

let licenceSearchService: LicenceSearchService
const licenceClient = new LicenceClient() as jest.Mocked<LicenceClient>
const signInService = new SignInService(null) as jest.Mocked<SignInService>
let nomisClient
let nomisClientBuilder

describe('licenceSearchService', () => {
  beforeEach(async () => {
    signInService.getClientCredentialsTokens.mockResolvedValue('a token')

    nomisClient = {
      getBookingByOffenderNumber: jest.fn().mockReturnValue({ bookingId: 1 }),
    }

    nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)
    licenceSearchService = new LicenceSearchService(licenceClient, signInService, nomisClientBuilder)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('findLicenceFor', () => {
    it('Should find when searching by booking id', async () => {
      licenceClient.getLicenceIncludingSoftDeleted.mockResolvedValue({ booking_id: 1234 } as never)

      const bookingId = await licenceSearchService.findForId('user-1', '1234')

      expect(bookingId).toBe(1234)
    })

    it('Should trim input when searching by booking id', async () => {
      licenceClient.getLicenceIncludingSoftDeleted.mockResolvedValue({ booking_id: 1234 } as never)

      const bookingId = await licenceSearchService.findForId('user-1', '  1234   ')

      expect(bookingId).toBe(1234)
    })

    it('Should find when searching by offender number', async () => {
      nomisClient.getBookingByOffenderNumber.mockReturnValue({ bookingId: 1234 })
      licenceClient.getLicenceIncludingSoftDeleted.mockResolvedValueOnce({ booking_id: 1234 } as never)

      const bookingId = await licenceSearchService.findForId('user-1', 'ABC1234')

      expect(bookingId).toBe(1234)
      expect(signInService.getClientCredentialsTokens).toHaveBeenCalledWith('user-1')
      expect(nomisClient.getBookingByOffenderNumber).toHaveBeenCalledWith('ABC1234')
    })

    it('Can cope with 404 when searching by offender number', async () => {
      licenceClient.getLicenceIncludingSoftDeleted.mockResolvedValue(null as never)
      nomisClient.getBookingByOffenderNumber.mockRejectedValue({ status: 404 })

      const bookingId = await licenceSearchService.findForId('user-1', 'ABC1234')

      expect(bookingId).toBe(null)
      expect(signInService.getClientCredentialsTokens).toHaveBeenCalledWith('user-1')
      expect(nomisClient.getBookingByOffenderNumber).toHaveBeenCalledWith('ABC1234')
    })

    it('propagates other http errors when searching by offender number', async () => {
      licenceClient.getLicenceIncludingSoftDeleted.mockResolvedValue(null as never)
      nomisClient.getBookingByOffenderNumber.mockRejectedValue({ status: 500 })

      return expect(licenceSearchService.findForId('user-1', 'ABC1234')).rejects.toStrictEqual({ status: 500 })
    })
  })
})
