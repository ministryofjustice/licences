#!/usr/bin/env node
import { auditTableReader } from './statistics/tableReader'
import { AuditStatisticsCollector } from './statistics/AuditStatisticsCollector'

const collectAuditStatistics = async () => {
  const collector = new AuditStatisticsCollector()
  await auditTableReader.consumeTable(collector)
  console.log(JSON.stringify(collector.tree))
}

collectAuditStatistics()
