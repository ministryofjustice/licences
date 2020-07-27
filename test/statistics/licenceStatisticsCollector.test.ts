import { LicenceStatistics, LicenceStatisticsCollector } from '../../server/statistics/LicenceStatisticsCollector'
import { LicenceRow } from '../../server/statistics/types'
import { LicenceStage } from '../../server/services/config/licenceStage'

let collector: LicenceStatisticsCollector

beforeEach(() => {
  collector = new LicenceStatisticsCollector()
})

const INITIAL_STATE: LicenceStatistics = Object.freeze({
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
})

const DEFAULT_ROW: LicenceRow = Object.freeze({
  licence: {},
  booking_id: 1,
  stage: LicenceStage.ELIGIBILITY,
  started: new Date(),
})

const defaultRow = () => ({ ...DEFAULT_ROW })

describe('LicenceStatisticsCollector', () => {
  it('Initial state', () => {
    expect(collector).not.toBeUndefined()
    expect(collector.getStatistics()).toEqual(INITIAL_STATE)
  })

  it('consumes no rows', () => {
    collector.consumeRows([])
    expect(collector.getStatistics()).toEqual(INITIAL_STATE)
  })

  it('consumes a row', () => {
    collector.consumeRows([defaultRow()])
    expect(collector.getStatistics().total).toEqual(1)
  })
})
