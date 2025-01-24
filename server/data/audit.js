const logger = require('../../log')
const db = require('./dataAccess/db')

const keys = [
  'LOGIN',
  'LICENCE_RECORD_STARTED',
  'UPDATE_SECTION',
  'SEND',
  'NOTIFY',
  'CREATE_PDF',
  'USER_MANAGEMENT',
  'VARY_NOMIS_LICENCE_CREATED',
  'WARNINGS',
  'LICENCE_SEARCH',
  'LICENCE_STAGE_COM_DOWNLOAD',
  'LICENCES_REQUIRING_COM_DOWNLOAD',
  'COM_ASSIGNED_LICENCES_FOR_HANDOVER_DOWNLOAD',
  'LOCATIONS',
  'FUNCTIONAL_MAILBOX',
  'RESET',
  'CREATE_IN_HDC',
  'CREATE_IN_CVL',
]

/**
 * @typedef {import("../../types/audit").AuditClient} AuditClient
 */

/**
 * @return {AuditClient}
 */
module.exports = {
  deleteAll() {
    return db.query(`delete from audit`)
  },

  record(key, user, data) {
    if (!keys.includes(key)) {
      throw new Error(`Unknown audit key: ${key}`)
    }

    logger.info('AUDIT', { key })

    return addItem(key, user, data)
      .then(() => {
        logger.info('Audit item inserted')
      })
      .catch((error) => {
        logger.error('Error during audit insertion ', error.stack)
      })
  },

  async getEvents(action, filters, startMoment, endMoment) {
    const startTime = startMoment ? startMoment.toISOString() : null
    const endTime = endMoment ? endMoment.toISOString() : null

    const query = getEventQuery(action, filters, { startTime, endTime })

    const { rows } = await db.query(query)
    return rows
  },

  getEvent,
  getEventsForBooking,
}

function addItem(key, user, data) {
  const query = {
    text: `insert into audit ("user", action, details) values ($1, $2, $3);`,
    values: [user, key, data],
  }

  return db.query(query)
}

async function getEventsForBooking(bookingId) {
  const { rows } = await db.query({
    text: `select id, "timestamp", "user", action, details from audit where details::jsonb ->> 'bookingId' = $1 order by timestamp desc;`,
    values: [bookingId],
  })
  return rows
}

async function getEvent(eventId) {
  const { rows } = await db.query({
    text: `select id, "timestamp", "user", action, details from audit where id = $1;`,
    values: [eventId],
  })
  return rows[0]
}

function getEventQuery(action, filters, optionalQueries) {
  const text = `select * from audit where action = $1 and details @> $2`
  const values = [action, filters]

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
