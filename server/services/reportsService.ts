import { createObjectCsvStringifier } from 'csv-writer'
import moment from 'moment'

import type { Case } from '../data/licenceClientTypes'
import type { Prisoner } from 'prisonerOffenderSearchApi'
import type { OffenderDetail } from 'probationSearchApi'
import { LicenceClient } from '../data/licenceClient'
import SignInService from '../authentication/signInService'

export interface DecorationDetails {
  licences: Case[]
  prisoners: Prisoner[]
  probationDetails: OffenderDetail[]
}

export interface PrisonerProbationRecord {
  prisonerNumber: string
  prisonerFirstname: string
  prisonLastname: string
  HDCED: string
  PDU: string
}

export default class ReportsService {
  constructor(
    readonly licenceClient: LicenceClient,
    readonly signInService: SignInService,
    readonly prisonerSearchApi,
    readonly probationSearchApi
  ) {}

  private static isCloseToHdced(p: Prisoner): boolean {
    return moment(p.homeDetentionCurfewEligibilityDate, 'YYYY-MM-DD').isBetween(
      moment(),
      moment().add(14, 'weeks'),
      undefined,
      '[]'
    )
  }

  private static comAllocated(pd: OffenderDetail) {
    const results = pd?.offenderManagers.some(
      (om) => om.active === true && (om.staff.unallocated === false || !om.staff.code.endsWith('U'))
    )
    return results
  }

  private static getPduDescription(probationDetail: OffenderDetail): string {
    const activeOffenderManager = probationDetail?.offenderManagers.find((om) => om.active)
    return activeOffenderManager?.probationArea?.description || ''
  }

  private static getComName(probationDetail: OffenderDetail): string {
    if (!probationDetail || !ReportsService.comAllocated(probationDetail)) return ''
    const activeOffenderManager = probationDetail?.offenderManagers.find((om) => om.active)
    const { forenames, surname } = activeOffenderManager.staff
    return `${forenames} ${surname}`
  }

  private async getEligibleLicencesWithAddressOrCasLocation(): Promise<Case[]> {
    const eligibleLicencesWithAddressOrCasLocation =
      await this.licenceClient.getLicencesInStageWithAddressOrCasLocation('ELIGIBILITY')
    return eligibleLicencesWithAddressOrCasLocation
  }

  private async getPrisonersForPrisonCloseToHdced(
    username: string,
    prisonId: string,
    bookingIds: number[]
  ): Promise<Prisoner[]> {
    const systemToken = await this.signInService.getClientCredentialsTokens(username)
    const prisoners = await this.prisonerSearchApi(systemToken).getPrisoners(bookingIds)
    return prisoners.filter(
      (p: Prisoner) => p.prisonId === prisonId && p.status !== 'INACTIVE OUT' && ReportsService.isCloseToHdced(p)
    )
  }

  private async getProbationDetails(username: string, offenderNumbers: string[]): Promise<OffenderDetail[]> {
    const systemToken = await this.signInService.getClientCredentialsTokens(username)
    const probationDetails = await this.probationSearchApi(systemToken).getPersonProbationDetails(offenderNumbers)
    return probationDetails
  }

  private getPrisonerDecoratedLicences = (prisoners: Prisoner[]) => (licencesAcc: Case[], licence: Case) => {
    const prisoner = prisoners.find((p) => p.bookingId === licence.booking_id.toString())
    if (!prisoner || prisoner.status === 'INACTIVE OUT') return licencesAcc
    return [
      ...licencesAcc,
      {
        prisonerNumber: prisoner.prisonerNumber,
        prisonId: prisoner.prisonId,
        prisonName: prisoner.prisonName,
        handoverDate: moment(licence.transition_date, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY'),
        HDCED: moment(prisoner.homeDetentionCurfewEligibilityDate).format('DD-MM-YYYY'),
      },
    ]
  }

  private getPrisonerProbationRecord(prisoner: Prisoner, pdu: string): PrisonerProbationRecord[] {
    return [
      {
        prisonerNumber: prisoner.prisonerNumber,
        prisonerFirstname: prisoner.firstName,
        prisonLastname: prisoner.lastName,
        HDCED: moment(prisoner.homeDetentionCurfewEligibilityDate).format('DD-MM-YYYY'),
        PDU: pdu,
      },
    ]
  }

  private getUnallocatedPrisonerProbationDecoratedLicences = ({
    licences,
    prisoners,
    probationDetails,
  }: DecorationDetails) => {
    return licences.flatMap((l) => {
      const prisoner = prisoners.find((p) => p.bookingId === l.booking_id.toString())
      if (!prisoner) return []
      const probationDetail = probationDetails.find((pd) => pd.otherIds.nomsNumber === prisoner.prisonerNumber)
      const comAllocated = ReportsService.comAllocated(probationDetail)
      if (comAllocated) return []

      const pdu = !probationDetail ? '' : ReportsService.getPduDescription(probationDetail)
      return this.getPrisonerProbationRecord(prisoner, pdu)
    })
  }

  private getComAllocatedPrisonerProbationDecoratedLicences = ({
    licences,
    prisoners,
    probationDetails,
  }: DecorationDetails) => {
    return licences.flatMap((l) => {
      const prisoner = prisoners.find((p) => p.bookingId === l.booking_id.toString())
      if (!prisoner) return []
      const probationDetail = probationDetails.find((pd) => pd.otherIds.nomsNumber === prisoner.prisonerNumber)
      if (!probationDetail) return []
      const pdu = ReportsService.getPduDescription(probationDetail)
      return this.getPrisonerProbationRecord(prisoner, pdu)
    })
  }

  private getPrisonerComProbationDecoratedLicences = ({ licences, prisoners, probationDetails }: DecorationDetails) => {
    return licences.flatMap((l) => {
      const prisoner = prisoners.find((p) => p.bookingId === l.booking_id.toString())
      if (!prisoner) return []
      const probationDetail = probationDetails.find((pd) => pd.otherIds.nomsNumber === prisoner.prisonerNumber)
      const com = ReportsService.getComName(probationDetail)
      const pdu = ReportsService.getPduDescription(probationDetail)
      return [
        {
          prisonerNumber: prisoner.prisonerNumber,
          prisonerFirstname: prisoner.firstName,
          prisonLastname: prisoner.lastName,
          HDCED: moment(prisoner.homeDetentionCurfewEligibilityDate).format('DD-MM-YYYY'),
          COM: com,
          PDU: pdu,
        },
      ]
    })
  }

  private getPrisonerDecoratedLicencesCSV = (records) => {
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

  private getPrisonerProbationDecoratedLicencesCSV = (records) => {
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

  private getlicencesWithNameComAndPduCSV = (records) => {
    const writer = createObjectCsvStringifier({
      header: [
        { id: 'prisonerNumber', title: 'PRISON_NUMBER' },
        { id: 'prisonerFirstname', title: 'PRISONER_FIRSTNAME' },
        { id: 'prisonLastname', title: 'PRISONER_LASTNAME' },
        { id: 'HDCED', title: 'HDCED' },
        { id: 'COM', title: 'COM' },
        { id: 'PDU', title: 'PDU' },
      ],
    })
    return writer.getHeaderString() + writer.stringifyRecords(records)
  }

  async getLicencesInStageCOM(username: string): Promise<string> {
    const licencesWithCOM = await this.licenceClient.getLicencesInStage('PROCESSING_RO')
    const bookingIds = licencesWithCOM.map((l) => l.booking_id)
    const systemToken = await this.signInService.getClientCredentialsTokens(username)
    const prisoners = await this.prisonerSearchApi(systemToken).getPrisoners(bookingIds)
    const licencesAcc = []
    const decoratedLicences = licencesWithCOM.reduce(this.getPrisonerDecoratedLicences(prisoners), licencesAcc)
    return this.getPrisonerDecoratedLicencesCSV(decoratedLicences)
  }

  async getLicencesWithAndWithoutComAssignment(username: string): Promise<string> {
    const licences = await this.getEligibleLicencesWithAddressOrCasLocation()
    const bookingIds = licences.map((l) => l.booking_id)

    const systemToken = await this.signInService.getClientCredentialsTokens(username)
    const prisoners = await this.prisonerSearchApi(systemToken).getPrisoners(bookingIds)
    const prisonersCloseToHdced = prisoners.filter(
      (p) => p.status !== 'INACTIVE OUT' && ReportsService.isCloseToHdced(p)
    )
    const offenderNumbers = prisonersCloseToHdced.map((p) => p.prisonerNumber)
    const probationDetails = await this.getProbationDetails(username, offenderNumbers)
    const decoratedLicences = this.getPrisonerComProbationDecoratedLicences({
      licences: licences,
      prisoners: prisonersCloseToHdced,
      probationDetails,
    })
    return this.getlicencesWithNameComAndPduCSV(decoratedLicences)
  }

  async getLicencesRequiringComAssignment(username: string, prisonId: string): Promise<string> {
    const licences = await this.getEligibleLicencesWithAddressOrCasLocation()
    const bookingIds = licences.map((l) => l.booking_id)
    const prisoners = await this.getPrisonersForPrisonCloseToHdced(username, prisonId, bookingIds)
    const offenderNumbers = prisoners.map((p) => p.prisonerNumber)
    const probationDetails = await this.getProbationDetails(username, offenderNumbers)
    const decoratedLicences = this.getUnallocatedPrisonerProbationDecoratedLicences({
      licences,
      prisoners,
      probationDetails,
    })
    return this.getPrisonerProbationDecoratedLicencesCSV(decoratedLicences)
  }

  async getComAssignedLicencesForHandover(username: string, prisonId: string): Promise<string> {
    const licences = await this.getEligibleLicencesWithAddressOrCasLocation()
    const bookingIds = licences.map((l) => l.booking_id)
    const prisoners = await this.getPrisonersForPrisonCloseToHdced(username, prisonId, bookingIds)
    const offenderNumbers = prisoners.map((p) => p.prisonerNumber)
    const probationDetails = await this.getProbationDetails(username, offenderNumbers)
    const allocatedProbationDetails = probationDetails.filter((pd) => ReportsService.comAllocated(pd))
    const decoratedLicences = this.getComAllocatedPrisonerProbationDecoratedLicences({
      licences,
      prisoners,
      probationDetails: allocatedProbationDetails,
    })
    return this.getPrisonerProbationDecoratedLicencesCSV(decoratedLicences)
  }
}
