jest.mock('../../server/data/dataAccess/db')

const configClient = require('../../server/data/configClient')
/** @type {any} */
const db = require('../../server/data/dataAccess/db')

beforeEach(() => {
  db.query.mockReturnValue({ rows: [] })
})

afterEach(() => {
  db.query.mockReset()
})

describe('configClient', () => {
  const mailbox1 = {
    id: 'id1',
    establishment: 'establishment1',
    email: 'email1',
    name: 'name1',
    role: 'role1',
  }

  const mailbox2 = {
    id: 'id2',
    establishment: 'establishment2',
    email: 'email2',
    name: 'name2',
    role: 'role2',
  }

  const standardResponse = { rows: [mailbox1, mailbox2] }

  describe('getAllMailboxes', () => {
    test('should call query', () => {
      configClient.getAllMailboxes()
      expect(db.query).toHaveBeenCalledTimes(1)
    })
  })

  describe('getMailbox', () => {
    test('should call query', () => {
      configClient.getMailbox('id')
      expect(db.query).toHaveBeenCalledTimes(1)
    })

    test('saaahould pass in the correct sql and params', async () => {
      db.query.mockReturnValue(standardResponse)
      const expectedSelectClause = 'select id, email, establishment, role, name from'
      const expectedWhereClause = 'where id = $1'

      await configClient.getMailbox('id')

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toContain(expectedSelectClause)
      expect(text).toContain(expectedWhereClause)
      expect(values).toEqual(['id'])
    })

    test('should handle empty result', async () => {
      await configClient.getMailbox('id')
      expect(db.query).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateMailbox', () => {
    test('should pass in the correct sql and params', async () => {
      const expectedUpdateClause = 'update notifications_config'
      const expectedSetClause = 'set email = $2, establishment = $3, role = $4, name = $5'
      const expectedWhereClause = 'where id = $1'

      await configClient.updateMailbox(1, {
        email: 'email1',
        establishment: 'establishment1',
        role: 'role1',
        name: 'name1',
      })

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toContain(expectedUpdateClause)
      expect(text).toContain(expectedSetClause)
      expect(text).toContain(expectedWhereClause)
      expect(values).toEqual([1, 'email1', 'establishment1', 'role1', 'name1'])
    })
  })

  describe('deleteMailbox', () => {
    test('should pass in the correct sql and params', async () => {
      const expectedClause = 'delete from notifications_config where id = $1'

      await configClient.deleteMailbox('1')

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toContain(expectedClause)
      expect(values).toEqual(['1'])
    })
  })

  describe('addMailbox', () => {
    test('should pass in the correct sql and params', async () => {
      const expectedInsertClause = 'insert into notifications_config'
      const expectedColsClause = '(email, establishment, role, name)'
      const expectedValuesClause = 'values($1, $2, $3, $4)'

      await configClient.addMailbox({
        email: 'email1',
        establishment: 'establishment1',
        role: 'role1',
        name: 'name1',
      })

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toContain(expectedInsertClause)
      expect(text).toContain(expectedColsClause)
      expect(text).toContain(expectedValuesClause)
      expect(values).toEqual(['email1', 'establishment1', 'role1', 'name1'])
    })
  })

  describe('getJobSpec', () => {
    test('should pass in the correct params', async () => {
      db.query.mockReturnValue({ rows: [{}] })

      await configClient.getJobSpec('name')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(['name'])
    })
  })

  describe('setJobSpec', () => {
    test('should pass in the correct params', async () => {
      await configClient.setJobSpec('name', 'spec')

      const { values } = db.query.mock.calls[0][0]
      expect(values).toEqual(['name', 'spec'])
    })
  })
})
