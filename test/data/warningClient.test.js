jest.mock('../../server/data/dataAccess/db')

const warningClient = require('../../server/data/warningClient')
/** @type {any} */
const db = require('../../server/data/dataAccess/db')

afterEach(() => {
  db.query.mockReset()
})

describe('warningClient', () => {
  describe('deleteAll', () => {
    test('should pass in the correct sql', async () => {
      await warningClient.deleteAll()

      const arg = db.query.mock.calls[0][0]
      expect(arg).toEqual('delete from warnings')
    })
  })

  describe('raiseWarning', () => {
    test('should pass in the correct sql', async () => {
      const expectedInsert = `INSERT INTO warnings (booking_id, code, message, acknowledged) VALUES ($1, $2, $3, false) 
      ON CONFLICT (booking_id, code) where acknowledged = false DO NOTHING`

      await warningClient.raiseWarning(1, 'code-1', 'messsage-1')

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toEqual(expectedInsert)
      expect(values).toEqual([1, 'code-1', 'messsage-1'])
    })
  })

  describe('acknowledgeWarnings', () => {
    test('should pass in the correct sql', async () => {
      db.query.mockReturnValue({ rowCount: 2 })
      const expectedInsert = "UPDATE warnings SET acknowledged = true WHERE id in ('1','2')"

      await warningClient.acknowledgeWarnings([1, 2])

      const { text } = db.query.mock.calls[0][0]
      expect(text).toEqual(expectedInsert)
    })

    test('should return modified row count', async () => {
      db.query.mockReturnValue({ rowCount: 2 })
      const result = await warningClient.acknowledgeWarnings([1, 2])
      expect(result).toBe(2)
    })
  })

  describe('getAcknowledgedWarnings', () => {
    test('should pass in the correct sql', async () => {
      db.query.mockReturnValue({ rows: [{ count: 1 }] })

      await warningClient.getAcknowledgedWarnings()

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toEqual(`SELECT id
      ,      booking_id "bookingId"
      ,      timestamp 
      ,      code
      ,      message
      FROM warnings   
      where acknowledged = true
      ORDER BY timestamp DESC
      LIMIT 500`)
      expect(values).toEqual(undefined)
    })
  })

  describe('getOutstandingWarnings', () => {
    test('should pass in the correct sql', async () => {
      db.query.mockReturnValue({ rows: [{ count: 1 }] })

      await warningClient.getOutstandingWarnings()

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toEqual(`SELECT id
      ,      booking_id "bookingId"
      ,      timestamp 
      ,      code
      ,      message
      FROM warnings   
      where acknowledged = false
      ORDER BY timestamp DESC
      LIMIT 500`)
      expect(values).toEqual(undefined)
    })
  })
})
