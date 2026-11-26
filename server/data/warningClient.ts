import format from 'pg-format'
import * as db from './dataAccess/db'

export interface Warning {
  id: number
  bookingId: number
  timestamp: Date
  code: string
  message: string
}

export class WarningClient {
  async deleteAll(): Promise<void> {
    await db.query(`delete from warnings`)
  }

  async raiseWarning(bookingId: number, code: string, message: string): Promise<void> {
    const query = {
      text: `INSERT INTO warnings (booking_id, code, message, acknowledged) VALUES ($1, $2, $3, false)
      ON CONFLICT (booking_id, code) where acknowledged = false DO NOTHING`,
      values: [bookingId, code, message],
    }
    await db.query(query)
  }

  async acknowledgeWarnings(errorIds: number[]): Promise<number> {
    const query = {
      text: format(`UPDATE warnings SET acknowledged = true WHERE id in (%L)`, errorIds),
    }

    const { rowCount } = await db.query(query)
    return rowCount
  }

  async getOutstandingWarnings(): Promise<Warning[]> {
    const query = {
      text: `SELECT id
      ,      booking_id "bookingId"
      ,      timestamp
      ,      code
      ,      message
      FROM warnings
      where acknowledged = false
      ORDER BY timestamp DESC
      LIMIT 500`,
    }
    const { rows } = await db.query(query)
    return rows
  }

  async getAcknowledgedWarnings(): Promise<Warning[]> {
    const query = {
      text: `SELECT id
      ,      booking_id "bookingId"
      ,      timestamp
      ,      code
      ,      message
      FROM warnings
      where acknowledged = true
      ORDER BY timestamp DESC
      LIMIT 500`,
    }
    const { rows } = await db.query(query)
    return rows
  }
}
