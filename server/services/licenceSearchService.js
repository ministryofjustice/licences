const { createObjectCsvStringifier } = require('csv-writer')
const moment = require('moment')

/**
 * @typedef {import("../../types/licences").LicenceSearchService} LicenceSearchService
 */

/**
 * @return {LicenceSearchService} LicenceSearchService
 */

module.exports = function createLicenceSearchService(licenceClient, signInService, prisonerSearchApi) {
  return {
    async findForIdentifier(offenderIdentifier) {
      const idAsBookingId = parseInt(offenderIdentifier.trim(), 10)
      if (!Number.isNaN(idAsBookingId)) {
        return licenceClient.getAllLicencesForBookingId(idAsBookingId)
      }
      return licenceClient.getAllLicencesForPrisonNumber(offenderIdentifier.trim())
    },

    async getLicencesInStageCOM(username) {
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
