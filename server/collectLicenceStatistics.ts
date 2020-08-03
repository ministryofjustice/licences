#!/usr/bin/env node
import moment from 'moment'
import { licenceTableReader } from './statistics/tableReader'
import { LicenceStatisticsCollector } from './statistics/LicenceStatisticsCollector'
import RowFilter from './statistics/rowFilter'
import { LicenceRow } from './statistics/types'

const CUTOFFF_DATE = moment('2020-02-03')

const collectLicenceStatistics = async () => {
  const collector = new LicenceStatisticsCollector()
  const filter = new RowFilter(collector, (row: LicenceRow) => moment(row.started).isSameOrAfter(CUTOFFF_DATE))
  await licenceTableReader.consumeTable(filter)
  const statistics = collector.getStatistics()
  console.log(JSON.stringify(statistics, null, 2))

  const noOutcomeCount =
    statistics.total -
    (statistics.postponed.total +
      statistics.approved +
      statistics.refused +
      statistics.optedOut +
      statistics.ineligible +
      statistics.failedFinalChecks)

  console.log(
    `${statistics.total} cases were started on or after ${CUTOFFF_DATE}. Of these ${noOutcomeCount} have no outcome`
  )
}

collectLicenceStatistics()
