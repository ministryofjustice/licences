const createLicenceSearchService = require('../../server/services/licenceSearchService')

const licenceClient = {
  getLicence: jest.fn(),
}

const signInService = {
  getClientCredentialsTokens: jest.fn().mockReturnValue('a token'),
}

const nomisClient = {
  getBookingByOffenderNumber: jest.fn().mockReturnValue({ bookingId: 1 }),
}

const nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)

let licenceSearchService

describe('licenceSearchService', () => {
  beforeEach(async () => {
    licenceSearchService = await createLicenceSearchService(licenceClient, signInService, nomisClientBuilder)
  })

  afterEach(() => {
    jest.restoreAllMocks()
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
})
