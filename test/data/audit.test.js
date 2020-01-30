const moment = require('moment')

const audit = require('../../server/data/audit')
const db = require('../../server/data/dataAccess/db')

jest.mock('../../server/data/dataAccess/db')

afterEach(() => {
  db.query.mockReset()
})

describe('Audit', () => {
  describe('deleteAll', () => {
    test('should pass in the correct sql', async () => {
      await audit.deleteAll()

      const arg = db.query.mock.calls[0][0]
      expect(arg).toEqual('delete from audit')
    })
  })

  describe('record', () => {
    beforeEach(() => {
      db.query.mockResolvedValue({})
    })

    test('should reject if unspecified key', () => {
      expect(() => audit.record('Key', 'a@y.com', { data: 'data' })).toThrowError(Error)
    })

    test('should call auditData.execSql', async () => {
      await audit.record('LOGIN', 'a@y.com', { data: 'data' })

      expect(db.query).toHaveBeenCalled()
    })

    test('should pass the sql parameters', async () => {
      await audit.record('LOGIN', 'a@y.com', { data: 'data' })
      const expectedParameters = ['a@y.com', 'LOGIN', { data: 'data' }]

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(expectedParameters)
    })
  })

  describe('getEventForBooking', () => {
    beforeEach(() => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] })
    })

    test('should make the query', async () => {
      const result = await audit.getEventsForBooking(1)
      expect(result).toEqual([{ id: 1 }])

      const { values, text } = db.query.mock.calls[0][0]
      expect(values).toEqual([1])
      expect(text).toEqual(
        `select id, "timestamp", "user", action, details from audit where details::jsonb ->> 'bookingId' = $1 order by timestamp desc;`
      )
    })
  })

  describe('getEvent', () => {
    beforeEach(() => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] })
    })

    test('should make the query', async () => {
      const result = await audit.getEvent(1)
      expect(result).toEqual({ id: 1 })

      const { values, text } = db.query.mock.calls[0][0]
      expect(values).toEqual([1])
      expect(text).toEqual(`select id, "timestamp", "user", action, details from audit where id = $1;`)
    })
  })

  describe('getEvents', () => {
    beforeEach(() => {
      db.query.mockReturnValue([])
    })

    test('should call auditData.execSql', async () => {
      await audit.getEvents('ACTION', { filter1: 'a', filter2: 'b' })

      expect(db.query).toHaveBeenCalled()
    })

    test('should pass in the correct query', async () => {
      await audit.getEvents('ACTION', { filter1: 'a', filter2: 'b' })

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toEqual('select * from audit where action = $1 and details @> $2')
      expect(values).toEqual(['ACTION', { filter1: 'a', filter2: 'b' }])
    })

    describe('Start and end dates are passed in', () => {
      test('should pass in the start date and end date', async () => {
        await audit.getEvents(
          'ACTION',
          { filter1: 'a' },
          moment('13-03-1985', 'DD-MM-YYYY'),
          moment('15-03-1985', 'DD-MM-YYYY')
        )

        const { text, values } = db.query.mock.calls[0][0]
        expect(text).toEqual(
          'select * from audit where action = $1 and details @> $2 and timestamp >= $3 and timestamp <= $4'
        )
        expect(values).toEqual([
          'ACTION',
          { filter1: 'a' },
          moment('13-03-1985', 'DD-MM-YYYY').toISOString(),
          moment('15-03-1985', 'DD-MM-YYYY').toISOString(),
        ])
      })

      test('should handle just a start date', async () => {
        await audit.getEvents('ACTION', { filter1: 'a' }, moment('13-03-1985', 'DD-MM-YYYY'), null)

        const { text, values } = db.query.mock.calls[0][0]
        expect(text).toEqual('select * from audit where action = $1 and details @> $2 and timestamp >= $3')
        expect(values).toEqual(['ACTION', { filter1: 'a' }, moment('13-03-1985', 'DD-MM-YYYY').toISOString()])
      })

      test('should handle just an end date', async () => {
        await audit.getEvents('ACTION', { filter1: 'a' }, null, moment('15-03-1985', 'DD-MM-YYYY'))

        const { text, values } = db.query.mock.calls[0][0]
        expect(text).toEqual('select * from audit where action = $1 and details @> $2 and timestamp <= $3')
        expect(values).toEqual(['ACTION', { filter1: 'a' }, moment('15-03-1985', 'DD-MM-YYYY').toISOString()])
      })
    })
  })
})
