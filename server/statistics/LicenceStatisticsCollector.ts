import { LicenceRow, RowConsumer } from './types'
import { Licence } from '../data/licenceTypes'

export interface LicenceStatistics {
  ineligible: number
  vary: number
  selectedCurfewAddress: number
  selectedBassAddress: number
  optedOut: number
  approvedPremisesRequired: number
  failedFinalChecks: number
  postponed: {
    outstandingRisk: number
    investigation: number
    total: number
  }
  approved: number
  refused: number
  licencesCreated: { [template: string]: number }
  total: number
}

const YES = 'Yes'
const NO = 'No'

const isExcluded = (licence: Licence): boolean => licence?.eligibility?.excluded?.decision === YES
const isNotSuitable = (licence: Licence): boolean => licence?.eligibility?.suitability?.decision === YES
const isCrdTime = (licence: Licence): boolean => licence?.eligibility?.crdTime?.decision === YES
const isIneligible = (licence: Licence): boolean => isExcluded(licence) || isNotSuitable(licence) || isCrdTime(licence)

const isOptedOut = (licence: Licence): boolean => licence?.proposedAddress?.optOut?.decision === YES
const isProposedAddress = (licence: Licence): boolean => licence?.proposedAddress?.addressProposed?.decision === YES
const isBASSRequested = (licence: Licence): boolean => licence?.bassReferral?.bassRequest?.bassRequested === YES

const isOnRemand = (licence: Licence): boolean => licence?.finalChecks?.onRemand?.decision === YES
const hasConfiscationOrder = (licence: Licence): boolean => licence?.finalChecks?.confiscationOrder?.decision === YES
const hasSeriousOffence = (licence: Licence): boolean => licence?.finalChecks?.seriousOffence?.decision === YES
const hasUndulyLenientSentence = (licence: Licence): boolean =>
  licence?.finalChecks?.undulyLenientSentence?.decision === YES
const isSegregated = (licence: Licence): boolean => licence?.finalChecks?.segregation?.decision === YES

const isPostponed = (licence: Licence): boolean => licence?.finalChecks?.postpone?.decision === YES

const isPostponedOutstandingRisk = (licence: Licence): boolean =>
  isPostponed(licence) && licence?.finalChecks?.postpone?.postponeReason === 'outstandingRisk'

const isPostponedInvestigation = (licence: Licence): boolean =>
  isPostponed(licence) && licence?.finalChecks?.postpone?.postponeReason === 'investigation'

const isCurfewAddressApprovedPremisesRequired = (licence: Licence): boolean =>
  licence?.curfew?.approvedPremises?.required === YES

const isBassAddressApprovedPremisesRequired = (licence: Licence): boolean =>
  licence?.bassReferral?.bassAreaCheck?.approvedPremisesRequiredYesNo === YES

const isApprovedPremisesRequired = (licence: Licence): boolean =>
  (isProposedAddress(licence) && isCurfewAddressApprovedPremisesRequired(licence)) ||
  (isBASSRequested(licence) && isBassAddressApprovedPremisesRequired(licence))

export class LicenceStatisticsCollector implements RowConsumer<LicenceRow> {
  private statistics: LicenceStatistics = {
    ineligible: 0,
    optedOut: 0,
    selectedCurfewAddress: 0,
    selectedBassAddress: 0,
    approvedPremisesRequired: 0,
    failedFinalChecks: 0,
    postponed: {
      outstandingRisk: 0,
      investigation: 0,
      total: 0,
    },
    approved: 0,
    refused: 0,
    licencesCreated: {},
    vary: 0,
    total: 0,
  }

  consumeRow(row: LicenceRow) {
    this.statistics.total += 1
    this.countVary(row)
    this.countIneligble(row)
    this.countAddressChoice(row)
    this.countApprovedPremisesRequired(row)
    this.countFailedFinalChecks(row)
    this.countPostponed(row)
    this.countApprovedAndRefused(row)
    this.countLicencesCreated(row)
  }

  consumeRows(rows: Array<LicenceRow>): void {
    rows.forEach(this.consumeRow, this)
  }

  getStatistics(): LicenceStatistics {
    return this.statistics
  }

  private countVary(row: LicenceRow): void {
    if (row.stage === 'VARY') {
      this.statistics.vary += 1
    }
  }

  private countIneligble(row: LicenceRow): void {
    if (isIneligible(row.licence)) this.statistics.ineligible += 1
  }

  private countApprovedAndRefused(row: LicenceRow) {
    switch (row?.licence?.approval?.release?.decision) {
      case YES:
        this.statistics.approved += 1
        break
      case NO:
        this.statistics.refused += 1
        break
      default:
        break
    }
  }

  private countAddressChoice(row: LicenceRow) {
    const proposedAddress = isProposedAddress(row.licence)
    const optedOut = isOptedOut(row.licence)
    const bassRequest = isBASSRequested(row.licence)

    if (optedOut) {
      this.statistics.optedOut += 1
      return
    }

    if (proposedAddress && !bassRequest) {
      this.statistics.selectedCurfewAddress += 1
    }

    if (bassRequest) {
      this.statistics.selectedBassAddress += 1
    }
  }

  private countFailedFinalChecks(row: LicenceRow) {
    const { licence } = row
    if (
      isOnRemand(licence) ||
      hasConfiscationOrder(licence) ||
      hasSeriousOffence(licence) ||
      hasUndulyLenientSentence(licence) ||
      isSegregated(licence)
    ) {
      this.statistics.failedFinalChecks += 1
    }
  }

  private countPostponed(row: LicenceRow) {
    if (isPostponed(row.licence)) this.statistics.postponed.total += 1
    if (isPostponedInvestigation(row.licence)) this.statistics.postponed.investigation += 1
    if (isPostponedOutstandingRisk(row.licence)) this.statistics.postponed.outstandingRisk += 1
  }

  private countApprovedPremisesRequired(row: LicenceRow) {
    if (isApprovedPremisesRequired(row?.licence)) this.statistics.approvedPremisesRequired += 1
  }

  private countLicencesCreated(row: LicenceRow) {
    const { template } = row
    if (!template) return

    const { licencesCreated } = this.statistics
    if (!licencesCreated[template]) {
      licencesCreated[template] = 0
    }
    licencesCreated[template] += 1
  }
}
