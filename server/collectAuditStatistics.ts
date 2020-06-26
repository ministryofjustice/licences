#!/usr/bin/env node
import { auditTableReader } from './statistics/tableReader'
import { AuditStatisticsCollector } from './statistics/AuditStatisticsCollector'
import { d3hierarchy } from './statistics/d3adapter'

const collectAuditStatistics = async () => {
  const collector = new AuditStatisticsCollector()
  await auditTableReader.consumeTable(collector)
  console.log(JSON.stringify(d3hierarchy(collector.tree)))
}

collectAuditStatistics()
