#!/usr/bin/env node
import moment from 'moment'
import R from 'ramda'
import { auditTableReaderForSendEvents, licenceTableReader } from './statistics/tableReader'
import { LicenceStatistics, LicenceStatisticsCollector } from './statistics/LicenceStatisticsCollector'
import RowFilter from './statistics/rowFilter'
import { AuditSendRow, LicenceRow } from './statistics/types'
import RowCollector from './statistics/RowCollector'
import SentenceSource from './statistics/sentenceSource'
import { OffenderSentence } from './data/nomisClientTypes'

const CUTOFFF_DATE = moment('2020-02-03')

const hasOutcome = (s: LicenceStatistics) =>
  // s.postponed.total > 0 ||
  s.approved > 0 || s.refused > 0 || s.optedOut > 0 || s.ineligible > 0 || s.failedFinalChecks > 0

const countAgency = (agencies, agencyId) => {
  if (agencies[agencyId]) {
    // eslint-disable-next-line no-param-reassign
    agencies[agencyId] += 1
  } else {
    // eslint-disable-next-line no-param-reassign
    agencies[agencyId] = 1
  }
}
const calculateNoOutcomeStatistics = (
  rows: Array<{
    licenceRow: LicenceRow
    statistics: LicenceStatistics
    sentence: OffenderSentence
    sends: AuditSendRow[]
  }>
) => {
  const stats = {
    beforeHdced: 0,
    over12WeeksToHdced: 0,
    afterHdced: 0,
    total: 0,
    agencyBeforeHdced: {},
    agencyAfterHdced: {},
    offendersAfterHdced: [],
  }
  const now = moment()

  rows.forEach((row) => {
    stats.total += 1

    const hdced = moment(row.sentence.sentenceDetail.homeDetentionCurfewEligibilityDate)

    if (now.isBefore(hdced)) {
      stats.beforeHdced += 1
      if (now.isBefore(hdced.subtract(12, 'weeks'))) {
        stats.over12WeeksToHdced += 1
      }
      countAgency(stats.agencyBeforeHdced, row.sentence.agencyLocationDesc)
    } else {
      stats.afterHdced += 1
      countAgency(stats.agencyAfterHdced, row.sentence.agencyLocationDesc)
      stats.offendersAfterHdced.push({
        bookingId: row.sentence.bookingId,
        OffenderNo: row.sentence.offenderNo,
        agencyId: row.sentence.agencyLocationId,
        agencyDesc: row.sentence.agencyLocationDesc,
        hdced: row.sentence.sentenceDetail.homeDetentionCurfewEligibilityDate,
        started: moment(row.licenceRow.started).format('YYYY-MM-DD'),
        stage: row.licenceRow.stage,
        stats: R.dissoc(
          'total',
          R.filter((n) => n > 0, row.statistics)
        ),
        sendEvents: row.sends?.map((s) => ({
          timestamp: moment(s.timestamp).format('YYYY-MM-DD'),
          source: s.source,
          target: s.target,
          transition: s.transition_type,
        })),
      })
    }
  })
  return stats
}

async function getLicenceRows() {
  const collector = new RowCollector<LicenceRow>()
  const filter = new RowFilter(collector, (row: LicenceRow) => moment(row.started).isSameOrAfter(CUTOFFF_DATE))
  await licenceTableReader.consumeTable(filter)
  return collector.rows
}

async function getAuditRows(): Promise<Map<number, Array<AuditSendRow>>> {
  const collector = new RowCollector<AuditSendRow>()
  const filter = new RowFilter<AuditSendRow>(
    collector,
    (row: AuditSendRow) => row?.timestamp && moment(row.timestamp).isSameOrAfter(CUTOFFF_DATE)
  )
  await auditTableReaderForSendEvents.consumeTable(filter)
  return collector.rows.reduce((map, row) => {
    if (!map.get(row.booking_id)) {
      map.set(row.booking_id, [])
    }
    map.get(row.booking_id).push(row)
    return map
  }, new Map<number, Array<AuditSendRow>>())
}

const addStatisticsRows = (licenceRows: LicenceRow[]) =>
  licenceRows.map((row) => {
    const collector = new LicenceStatisticsCollector()
    collector.consumeRow(row)
    return {
      licenceRow: row,
      statistics: collector.getStatistics(),
    }
  })

async function addSentences(rows: { licenceRow: LicenceRow; statistics: LicenceStatistics }[]) {
  const sentencesByBookingId = await new SentenceSource().getOffenderSentencesByBookingId(
    rows.map((row) => row.licenceRow.booking_id)
  )

  return rows.map((row) => ({
    ...row,
    sentence: sentencesByBookingId.get(row.licenceRow.booking_id),
  }))
}

function addAuditSendRows(
  rows: {
    sentence: OffenderSentence
    licenceRow: LicenceRow
    statistics: LicenceStatistics
  }[],
  auditSendRows: Map<number, Array<AuditSendRow>>
) {
  return rows.map((row) => ({ ...row, sends: auditSendRows.get(row.licenceRow.booking_id) }))
}

const collectLicenceStatistics = async () => {
  const licenceRows = await getLicenceRows()
  const statisticsRows = addStatisticsRows(licenceRows)

  const noOutcomeRows = statisticsRows.filter((row) => !hasOutcome(row.statistics))
  const noOutcomeRowsWithSentence = await addSentences(noOutcomeRows)
  const auditSendRows = await getAuditRows()
  const withAuditSendRows = addAuditSendRows(noOutcomeRowsWithSentence, auditSendRows)

  const noOutcomeStatistics = calculateNoOutcomeStatistics(withAuditSendRows)

  const statisticsCollector = new LicenceStatisticsCollector()
  statisticsCollector.consumeRows(licenceRows)

  noOutcomeStatistics.offendersAfterHdced.sort((a, b) => a.bookingId - b.bookingId)

  console.log(`
  stats: ${JSON.stringify(statisticsCollector.getStatistics(), null, 2)}
  no outcome stats: ${JSON.stringify(noOutcomeStatistics, null, 2)}
  `)
}

collectLicenceStatistics()
