#!/usr/bin/env node
import { licenceTableReader } from './statistics/tableReader'
import { LicenceStatisticsCollector } from './statistics/LicenceStatisticsCollector'

const collectLicenceStatistics = async () => {
  const collector = new LicenceStatisticsCollector()
  await licenceTableReader.consumeTable(collector)
  console.log(JSON.stringify(collector.getStatistics(), null, 2))
}

collectLicenceStatistics()
