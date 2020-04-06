/**
 * @typedef {import("../../types/licences").LicenceSearchService} LicenceSearchService
 */

/**
 * @return {LicenceSearchService} LicenceSearchService
 */
module.exports = function createLicenceSearchService(licenceClient, signInService, nomisClientBuilder) {
  const bookingIdForExistingLicence = async (bookingId) => {
    const licence = await licenceClient.getLicence(bookingId)
    return licence ? licence.booking_id : null
  }

  const findByBookingId = async (offenderIdentifier) => {
    const parsedBookingId = parseInt(offenderIdentifier.trim(), 10)
    return parsedBookingId && bookingIdForExistingLicence(parsedBookingId)
  }

  const findByOffenderNumber = async (username, offenderIdentifier) => {
    const systemToken = await signInService.getClientCredentialsTokens(username)
    const client = nomisClientBuilder(systemToken.token)

    try {
      const { bookingId } = await client.getBookingByOffenderNumber(offenderIdentifier)
      return bookingId && bookingIdForExistingLicence(bookingId)
    } catch (error) {
      if (error.status === 404) {
        return null
      }
      throw error
    }
  }

  return {
    async findForId(username, offenderIdentifier) {
      const bookingId = await findByBookingId(offenderIdentifier)
      if (bookingId) {
        return bookingId
      }
      return findByOffenderNumber(username, offenderIdentifier)
    },
  }
}
