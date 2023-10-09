const { createObjectCsvStringifier } = require('csv-writer')
const moment = require('moment')

/**
 * @typedef {import("../../types/licences").LicenceSearchService} LicenceSearchService
 */

/**
 * @return {LicenceSearchService} LicenceSearchService
 */

module.exports = function createLicenceSearchService(
  licenceClient,
  signInService,
  nomisClientBuilder,
  prisonerSearchApi
) {
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
    const client = nomisClientBuilder(systemToken)

    try {
      const booking = await client.getBookingByOffenderNumber(offenderIdentifier)
      if (!booking) return null
      const { bookingId } = booking
      return bookingId && bookingIdForExistingLicence(bookingId)
    } catch (error) {
      if (error.status === 404) {
        return null
      }
      throw error
    }
  }

  const getPrisonerDecoratedLicences = (prisoners) => (licencesAcc, licence) => {
    const prisoner = prisoners.find((p) => p.bookingId === licence.booking_id.toString())
    return [
      ...licencesAcc,
      {
        prisonerNumber: prisoner.prisonerNumber,
        prisonId: prisoner.prisonId,
        transitionDate: moment(licence.transition_date).format('DD-MM-YYYY'),
        HDCEDate: moment(prisoner.homeDetentionCurfewEligibilityDate).format('DD-MM-YYYY'),
      },
    ]
  }

  const getlicencesCSV = (records) => {
    const writer = createObjectCsvStringifier({
      header: [
        { id: 'prisonerNumber', title: 'PRISON_NUMBER' },
        { id: 'prisonId', title: 'PRISON_ID' },
        { id: 'transitionDate', title: 'TRANSITION_DATE' },
        { id: 'HDCEDate', title: 'HDCE_DATE' },
      ],
    })
    return writer.getHeaderString() + writer.stringifyRecords(records)
  }

  return {
    async findForId(username, offenderIdentifier) {
      const bookingId = await findByBookingId(offenderIdentifier)
      if (bookingId) {
        return bookingId
      }
      return findByOffenderNumber(username, offenderIdentifier)
    },

    async getLicencesInStageCOM(username) {
      const systemToken = await signInService.getClientCredentialsTokens(username)
      const licencesWithCOM = await licenceClient.getLicencesInStage('PROCESSING_RO', systemToken)
      const bookingIds = await licencesWithCOM.map((l) => l.booking_id)
      const prisoners = await prisonerSearchApi(systemToken).getPrisoners(bookingIds)
      const licencesAcc = []
      const prisonerDecoratedLicences = licencesWithCOM.reduce(getPrisonerDecoratedLicences(prisoners), licencesAcc)
      return getlicencesCSV(prisonerDecoratedLicences)
    },
  }
}
