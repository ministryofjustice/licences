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
  prisonerSearchApi,
  probationSearchApi
) {
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

  const getPrisonerDecoratedLicences = (prisoners) => (licencesAcc, licence) => {
    const prisoner = prisoners.find((p) => p.bookingId === licence.booking_id.toString())
    if (!prisoner || prisoner.status === 'INACTIVE OUT') return licencesAcc
    return [
      ...licencesAcc,
      {
        prisonerNumber: prisoner.prisonerNumber,
        prisonId: prisoner.prisonId,
        prisonName: prisoner.prisonName,
        handoverDate: moment(licence.transition_date).format('DD-MM-YYYY'),
        HDCED: moment(prisoner.homeDetentionCurfewEligibilityDate).format('DD-MM-YYYY'),
      },
    ]
  }

  const getlicencesCSV = (records) => {
    const writer = createObjectCsvStringifier({
      header: [
        { id: 'prisonerNumber', title: 'PRISON_NUMBER' },
        { id: 'prisonId', title: 'PRISON_ID' },
        { id: 'prisonName', title: 'PRISON_NAME' },
        { id: 'handoverDate', title: 'HANDOVER_DATE' },
        { id: 'HDCED', title: 'HDCED' },
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

    // @ts-ignore
    async getLicencesRequiringComAssignment(username, prisonId) {
      const systemToken = await signInService.getClientCredentialsTokens(username)
      const bookingIds = await licenceClient.getLicencesInStageWithAddressOrCasLocation('ELIGIBILITY', systemToken)
      const prisoners = await prisonerSearchApi(systemToken)
        .getPrisoners(bookingIds)
        .filter(
          (p) =>
            p.prisonId === prisonId &&
            moment(p.homeDetentionCurfewEligibilityDate).isBetween(moment(), moment().add(14, 'weeks'))
        )
      const offenderNumbers = await prisoners.map((p) => p.prisonerNumber)
      const pdus = await probationSearchApi(systemToken).getPersonProbationDetails(offenderNumbers)

      // call probation search with nomsNumbers and find PDU'S for those who have an unallocated COM (offenderManagers -> active = false)
      //

      // for each of the prisoners, get their HDCED, check that the HDCED is between today and 14 weeks from today
      // if it is use their prisoner record to create the CSV
      // before CSV, filter down so that it only contains information for the prison the user is in
    },
  }
}
