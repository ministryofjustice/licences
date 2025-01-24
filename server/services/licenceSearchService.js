/**
 * @typedef {import("../../types/licences").LicenceSearchService} LicenceSearchService
 */

/**
 * @return {LicenceSearchService} LicenceSearchService
 */

module.exports = function createLicenceSearchService(licenceClient, signInService, nomisClientBuilder) {
  const bookingIdForLicenceIncludingSoftDeleted = async (bookingId) => {
    const licence = await licenceClient.getLicenceIncludingSoftDeleted(bookingId)
    return licence ? licence.booking_id : null
  }

  const findByBookingId = async (offenderIdentifier) => {
    const parsedBookingId = parseInt(offenderIdentifier.trim(), 10)
    return parsedBookingId && bookingIdForLicenceIncludingSoftDeleted(parsedBookingId)
  }

  const findByOffenderNumber = async (username, offenderIdentifier) => {
    const systemToken = await signInService.getClientCredentialsTokens(username)
    const client = nomisClientBuilder(systemToken)

    try {
      const booking = await client.getBookingByOffenderNumber(offenderIdentifier)
      if (!booking) return null
      const { bookingId } = booking
      return bookingId && bookingIdForLicenceIncludingSoftDeleted(bookingId)
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
