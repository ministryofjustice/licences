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

  const getPrisonerProbationDecoratedLicences =
    ({ prisoners, probationDetails }) =>
    (licencesAcc, licence) => {
      const prisoner = prisoners.find((p) => p.bookingId === licence.booking_id.toString())
      if (!prisoner || prisoner.status === 'INACTIVE OUT') return licencesAcc

      const probationDetail = probationDetails.find((pd) => pd.otherIds.nomsNumber === prisoner.prisonerNumber)
      if (!probationDetail) return licencesAcc
      return [
        ...licencesAcc,
        {
          prisonerNumber: prisoner.prisonerNumber,
          prisonerFirstname: prisoner.firstName,
          prisonLastname: prisoner.lastName,
          HDCED: moment(prisoner.homeDetentionCurfewEligibilityDate).format('DD-MM-YYYY'),
          PDU: probationDetail.offenderManagers[0].probationArea.description,
        },
      ]
    }

  const getlicencesUnallocatedComCSV = (records) => {
    const writer = createObjectCsvStringifier({
      header: [
        { id: 'prisonerNumber', title: 'PRISON_NUMBER' },
        { id: 'prisonerFirstname', title: 'PRISONER_FIRSTNAME' },
        { id: 'prisonLastname', title: 'PRISONER_LASTNAME' },
        { id: 'HDCED', title: 'HDCED' },
        { id: 'PDU', title: 'PDU' },
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

    async getLicencesRequiringComAssignment(username, prisonId) {
      const systemToken = await signInService.getClientCredentialsTokens(username)
      const licencesInStageWithAddressOrCasLocation = await licenceClient.getLicencesInStageWithAddressOrCasLocation(
        'ELIGIBILITY',
        systemToken
      )
      const bookingIds = await licencesInStageWithAddressOrCasLocation.map((l) => l.booking_id)
      const prisoners = await prisonerSearchApi(systemToken).getPrisoners(bookingIds)
      const prisonersFilteredByPrisonCloseToHdced = await prisoners.filter(
        (p) =>
          p.prisonId === prisonId &&
          moment(p.homeDetentionCurfewEligibilityDate, 'YYYY-MM-DD').isBetween(moment(), moment().add(14, 'weeks'))
      )
      const offenderNumbers = await prisonersFilteredByPrisonCloseToHdced.map((p) => p.prisonerNumber)
      const probationDetails = await probationSearchApi(systemToken).getPersonProbationDetails(offenderNumbers)
      const probationDetailsWithUnallocatedCom = await probationDetails.filter((pd) => {
        const results = pd.offenderManagers.some(
          (om) => om.active === true && (om.staff.unallocated === true || om.staff.code.endsWith('U'))
        )
        return results
      })
      const licencesAcc = []
      const prisonerDecoratedLicences = licencesInStageWithAddressOrCasLocation.reduce(
        getPrisonerProbationDecoratedLicences({
          prisoners: prisonersFilteredByPrisonCloseToHdced,
          probationDetails: probationDetailsWithUnallocatedCom,
        }),
        licencesAcc
      )
      return getlicencesUnallocatedComCSV(prisonerDecoratedLicences)
    },
  }
}
