import { Moment } from 'moment'
import logger from '../../log'
import * as db from './dataAccess/db'

const keys = [
  'LOGIN',
  'LICENCE_RECORD_STARTED',
  'UPDATE_SECTION',
  'SEND',
  'NOTIFY',
  'CREATE_PDF',
  'USER_MANAGEMENT',
  'VARY_NOMIS_LICENCE_CREATED',
  'VARY_LICENCE_IN_CVL_CREATED',
  'WARNINGS',
  'LICENCE_SEARCH',
  'LICENCE_STAGE_COM_DOWNLOAD',
  'LICENCE_STAGE_CA_DOWNLOAD',
  'LICENCES_REQUIRING_COM_DOWNLOAD',
  'COM_ASSIGNED_LICENCES_FOR_HANDOVER_DOWNLOAD',
  'LOCATIONS',
  'FUNCTIONAL_MAILBOX',
  'RESET',
  'CREATE_IN_HDC',
  'CREATE_IN_CVL',
]

export interface AuditDto {
  id: number
  timestamp: Date
  user: string
  action: string
  details: object
}

export class AuditClient {
  deleteAll() {
    return db.query(`delete from audit`)
  }

  record(key: string, user: string, data: object): Promise<void> {
    if (!keys.includes(key)) {
      throw new Error(`Unknown audit key: ${key}`)
    }

    logger.info({ key }, 'AUDIT')

    return addItem(key, user, data)
      .then(() => {
        logger.info('Audit item inserted')
      })
      .catch((error) => {
        logger.error({ stack: error.stack }, 'Error during audit insertion ')
      })
  }

  async getEvents(action: string, filters: object, startMoment?: Moment, endMoment?: Moment): Promise<AuditDto[]> {
    const startTime = startMoment ? startMoment.toISOString() : null
    const endTime = endMoment ? endMoment.toISOString() : null

    const query = getEventQuery(action, filters, { startTime, endTime })

    const { rows } = await db.query(query)
    return rows
  }

  async getEvent(eventId: number): Promise<AuditDto> {
    const { rows } = await db.query({
      text: `select id, "timestamp", "user", action, details from audit where id = $1;`,
      values: [eventId],
    })
    return rows[0]
  }

  async getEventsForBooking(bookingId: number): Promise<AuditDto[]> {
    const { rows } = await db.query({
      text: `select id, "timestamp", "user", action, details from audit where details::jsonb ->> 'bookingId' = $1 order by timestamp desc;`,
      values: [bookingId],
    })
    return rows
  }
}

function addItem(key: string, user: string, data: object) {
  const query = {
    text: `insert into audit ("user", action, details) values ($1, $2, $3);`,
    values: [user, key, data],
  }

  return db.query(query)
}

function getEventQuery(
  action: string,
  filters: object,
  optionalQueries: { startTime: string | null; endTime: string | null }
) {
  const text = `select * from audit where action = $1 and details @> $2`
  const values: unknown[] = [action, filters]

  const queries = {
    startTime: 'and timestamp >=',
    endTime: 'and timestamp <=',
  }

  return Object.keys(queries).reduce(
    (query, filter) => {
      if (!optionalQueries[filter]) {
        return query
      }

      return {
        text: `${query.text} ${queries[filter]} $${query.values.length + 1}`,
        values: [...query.values, optionalQueries[filter]],
      }
    },
    { text, values }
  )
}
