import { createObjectCsvStringifier } from 'csv-writer'
import moment from 'moment'

import type { Case } from '../data/licenceClientTypes'
import type { Prisoner } from 'prisonerOffenderSearchApi'
import type { OffenderDetail } from 'probationSearchApi'
import { LicenceClient } from '../data/licenceClient'
import SignInService from '../authentication/signInService'

export = function createReportsService(
  licenceClient: LicenceClient,
  signInService: SignInService,
  prisonerSearchApi,
  probationSearchApi
) {
  const isCloseToHdced = (p: Prisoner): boolean => {
    return moment(p.homeDetentionCurfewEligibilityDate, 'YYYY-MM-DD').isBetween(
      moment(),
      moment().add(14, 'weeks'),
      undefined,
      '[]'
    )
  }

  const isUnallocated = (pd: OffenderDetail) => {
    const results = pd.offenderManagers.some(
      (om) => om.active === true && (om.staff.unallocated === true || om.staff.code.endsWith('U'))
    )
    return results
  }

  const getEligibleLicencesWithAddressOrCasLocation = async (): Promise<Case[]> => {
    const eligibleLicencesWithAddressOrCasLocation =
      await licenceClient.getLicencesInStageWithAddressOrCasLocation('ELIGIBILITY')
    return eligibleLicencesWithAddressOrCasLocation
  }

  const getPrisonersCloseToHdced = async (
    username: string,
    prisonId: string,
    bookingIds: number[]
  ): Promise<Prisoner[]> => {
    const systemToken = await signInService.getClientCredentialsTokens(username)
    const prisoners = await prisonerSearchApi(systemToken).getPrisoners(bookingIds)
    return prisoners.filter(
      (p: Prisoner) => p.prisonId === prisonId && p.status !== 'INACTIVE OUT' && isCloseToHdced(p)
    )
  }

  const getProbationDetails = async (username: string, offenderNumbers: string[]): Promise<OffenderDetail[]> => {
    const systemToken = await signInService.getClientCredentialsTokens(username)
    const probationDetails = await probationSearchApi(systemToken).getPersonProbationDetails(offenderNumbers)
    return probationDetails
  }

  const getPrisonerDecoratedLicences = (prisoners: Prisoner[]) => (licencesAcc: Case[], licence: Case) => {
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

  const getPrisonerProbationDecoratedLicences = ({ licences, prisoners, probationDetails }) => {
    return licences.flatMap((l: Case) => {
      const prisoner = prisoners.find((p: Prisoner) => p.bookingId === l.booking_id.toString())
      if (!prisoner) return []
      const probationDetail = probationDetails.find(
        (pd: OffenderDetail) => pd.otherIds.nomsNumber === prisoner.prisonerNumber
      )
      if (!probationDetail) return []
      const activeOffenderManager = probationDetail.offenderManagers.find((om) => om.active)
      const { description } = activeOffenderManager.probationArea
      return [
        {
          prisonerNumber: prisoner.prisonerNumber,
          prisonerFirstname: prisoner.firstName,
          prisonLastname: prisoner.lastName,
          HDCED: moment(prisoner.homeDetentionCurfewEligibilityDate).format('DD-MM-YYYY'),
          PDU: description || '',
        },
      ]
    })
  }

  const getPrisonerDecoratedLicencesCSV = (records) => {
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

  const getPrisonerProbationDecoratedLicencesCSV = (records) => {
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
    async getLicencesInStageCOM(username: string) {
      const licencesWithCOM = await licenceClient.getLicencesInStage('PROCESSING_RO')
      const bookingIds = licencesWithCOM.map((l) => l.booking_id)
      const systemToken = await signInService.getClientCredentialsTokens(username)
      const prisoners = await prisonerSearchApi(systemToken).getPrisoners(bookingIds)
      const licencesAcc = []
      const decoratedLicences = licencesWithCOM.reduce(getPrisonerDecoratedLicences(prisoners), licencesAcc)
      return getPrisonerDecoratedLicencesCSV(decoratedLicences)
    },

    async getLicencesRequiringComAssignment(username: string, prisonId: string) {
      const licences = await getEligibleLicencesWithAddressOrCasLocation()
      const bookingIds = licences.map((l) => l.booking_id)
      const prisoners = await getPrisonersCloseToHdced(username, prisonId, bookingIds)
      const offenderNumbers = prisoners.map((p) => p.prisonerNumber)
      const probationDetails = await getProbationDetails(username, offenderNumbers)
      const unallocatedProbationDetails = probationDetails.filter((pd) => isUnallocated(pd))
      const decoratedLicences = getPrisonerProbationDecoratedLicences({
        licences,
        prisoners,
        probationDetails: unallocatedProbationDetails,
      })
      return getPrisonerProbationDecoratedLicencesCSV(decoratedLicences)
    },

    async getComAssignedLicencesForHandover(username: string, prisonId: string) {
      const licences = await getEligibleLicencesWithAddressOrCasLocation()
      const bookingIds = licences.map((l) => l.booking_id)
      const prisoners = await getPrisonersCloseToHdced(username, prisonId, bookingIds)
      const offenderNumbers = prisoners.map((p) => p.prisonerNumber)
      const probationDetails = await getProbationDetails(username, offenderNumbers)
      const allocatedProbationDetails = probationDetails.filter((pd) => !isUnallocated(pd))
      const decoratedLicences = getPrisonerProbationDecoratedLicences({
        licences,
        prisoners,
        probationDetails: allocatedProbationDetails,
      })
      return getPrisonerProbationDecoratedLicencesCSV(decoratedLicences)
    },
  }
}
