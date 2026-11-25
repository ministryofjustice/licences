import hash from 'string-hash'
import dbLockingClient from '../../server/data/dbLockingClient'
import * as dbModule from '../../server/data/dataAccess/db'

jest.mock('../../server/data/dataAccess/db')

const db = dbModule as jest.Mocked<typeof dbModule>

afterEach(() => {
  db.query.mockReset()
})

describe('dbLockingClient', () => {
  const nameHash = hash('name')

  const standardResponse = { rows: [] }

  beforeEach(() => {
    db.query.mockResolvedValue(standardResponse)
  })

  describe('tryLock', () => {
    test('should call query', () => {
      dbLockingClient.tryLock('name')
      expect(db.query).toHaveBeenCalled()
      const { values } = db.query.mock.calls[0][0]
      expect(values).toContain(nameHash)
    })
  })

  describe('unlock', () => {
    test('should call query', () => {
      dbLockingClient.unlock('name')
      const { values } = db.query.mock.calls[0][0]
      expect(values).toContain(nameHash)
    })
  })
})
