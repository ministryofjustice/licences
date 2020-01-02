const hash = require('string-hash')

const dbLockingClient = require('../../server/data/dbLockingClient')
const db = require('../../server/data/dataAccess/db')

jest.mock('../../server/data/dataAccess/db')

afterEach(() => {
  db.query.mockReset()
})

describe('dbLockingClient', () => {
  const nameHash = hash('name')

  const standardResponse = { rows: [] }

  beforeEach(() => {
    db.query.mockReturnValue(standardResponse)
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
