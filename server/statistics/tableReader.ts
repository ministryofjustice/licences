import fs from 'fs'
import { Client } from 'pg'
import config from '../config'
import { AuditRow, AuditSendRow, LicenceRow, RowConsumer } from './types'

const CHUNK_SIZE = 20000

export class TableReader<R> {
  private readonly sql

  private readonly client: Client

  constructor(sql: string) {
    this.sql = sql
    this.client = new Client({
      user: config.db.username,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
      host: config.db.server,
      ssl:
        config.db.sslEnabled === 'true'
          ? {
              ca: fs.readFileSync('root.cert'),
              rejectUnauthorized: false,
            }
          : false,
    })
  }

  private async doReadTable(consumer) {
    let startRow = 0
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.client.query(this.sql, [CHUNK_SIZE, startRow])
      if (result.rowCount === 0) return
      consumer.consumeRows(result.rows)
      startRow += CHUNK_SIZE
    }
  }

  async consumeTable(consumer: RowConsumer<R>) {
    await this.client.connect()
    await this.doReadTable(consumer)
    await this.client.end()
  }
}

export const auditTableReader = new TableReader<AuditRow>(
  `select action,
              details,
              timestamp
         from audit
     order by id asc
        limit $1
       offset $2`
)

export const licenceTableReader = new TableReader<LicenceRow>(
  `select l.licence,
              l.booking_id,
              l.stage,
              lv.template,
              lv.version,
              lv.vary_version,
              a1.timestamp as started  -- When the case was started
         from licences l
              left outer join licence_versions lv on l.booking_id = lv.booking_id and
                                       lv.id = (
                                           select id from licence_versions lv2
                                           where lv2.booking_id = lv.booking_id
                                           order by lv2.version desc, lv2.vary_version desc
                                           limit 1
                                           )
              join audit a1 on l.booking_id = cast(a1.details ->> 'bookingId' as integer) and action = 'LICENCE_RECORD_STARTED'
     order by l.id asc
        limit $1
       offset $2`
)

export const auditTableReaderForSendEvents = new TableReader<AuditSendRow>(
  `select cast(details ->> 'bookingId' as integer) as booking_id,
          details #> '{ source }' as source,
          details #> '{ target }' as target,
          details ->> 'transitionType' as transition_type,
          timestamp
     from audit
    where action = 'SEND'
 order by timestamp asc
    limit $1
   offset $2`
)
