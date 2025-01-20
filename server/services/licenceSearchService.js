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

  const isUnallocated = (pd) => {
    const results = pd.offenderManagers.some(
      (om) => om.active === true && (om.staff.unallocated === true || om.staff.code.endsWith('U'))
    )
    return results
  }

  const isCloseToHdced = (p) => {
    return moment(p.homeDetentionCurfewEligibilityDate, 'YYYY-MM-DD').isBetween(
      moment(),
      moment().add(14, 'weeks'),
      undefined,
      '[]'
    )
  }

  const getPrisonerProbationDecoratedLicences = ({ licences, prisoners, probationDetails }) => {
    return licences.flatMap((l) => {
      const prisoner = prisoners.find((p) => p.bookingId === l.booking_id.toString())
      if (!prisoner) return []
      const probationDetail = probationDetails.find((pd) => pd.otherIds.nomsNumber === prisoner.prisonerNumber)
      if (!probationDetail) return []
      return [
        {
          prisonerNumber: prisoner.prisonerNumber,
          prisonerFirstname: prisoner.firstName,
          prisonLastname: prisoner.lastName,
          HDCED: moment(prisoner.homeDetentionCurfewEligibilityDate).format('DD-MM-YYYY'),
          PDU: probationDetail ? probationDetail.offenderManagers[0].probationArea.description : '',
        },
      ]
    })
  }

  const getlicencesWithNameAndPduCSV = (records) => {
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
      const bookingIds = licencesWithCOM.map((l) => l.booking_id)
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
      const bookingIds = licencesInStageWithAddressOrCasLocation.map((l) => l.booking_id)
      const prisoners = await prisonerSearchApi(systemToken).getPrisoners(bookingIds)
      const prisonersFilteredByPrisonCloseToHdced = prisoners.filter(
        (p) => p.prisonId === prisonId && p.status !== 'INACTIVE OUT' && isCloseToHdced(p)
      )
      const offenderNumbers = prisonersFilteredByPrisonCloseToHdced.map((p) => p.prisonerNumber)
      const probationDetails = await probationSearchApi(systemToken).getPersonProbationDetails(offenderNumbers)
      const unallocatedProbationDetails = probationDetails.filter((pd) => isUnallocated(pd))
      const decoratedLicences = getPrisonerProbationDecoratedLicences({
        licences: licencesInStageWithAddressOrCasLocation,
        prisoners: prisonersFilteredByPrisonCloseToHdced,
        probationDetails: unallocatedProbationDetails,
      })
      return getlicencesWithNameAndPduCSV(decoratedLicences)
    },
  }
}
