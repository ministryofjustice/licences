const proxyquire = require('proxyquire')

proxyquire.noCallThru()

describe('configClient', () => {
  let queryStub

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
  const userProxy = (query = queryStub) => {
    return proxyquire('../../server/data/configClient', {
      './dataAccess/db': {
        query,
      },
    })
  }

  beforeEach(() => {
    queryStub = sinon.stub().resolves(standardResponse)
  })

  describe('getAllMailboxes', () => {
    it('should call query', () => {
      userProxy().getAllMailboxes()
      expect(queryStub).to.have.callCount(1)
    })
  })

  describe('getMailbox', () => {
    it('should call query', () => {
      userProxy().getMailbox('id')
      expect(queryStub).to.have.callCount(1)
    })

    it('should pass in the correct sql and params', () => {
      const expectedSelectClause = 'select id, email, establishment, role, name from'
      const expectedWhereClause = 'where id = $1'

      const result = userProxy().getMailbox('id')

      return result.then(() => {
        const call = queryStub.getCalls()[0].args[0]
        expect(call.text).includes(expectedSelectClause)
        expect(call.text).includes(expectedWhereClause)
        expect(call.values).to.eql(['id'])
      })
    })

    it('should handle empty result', () => {
      queryStub = sinon.stub().resolves({})
      userProxy().getMailbox('id')
      expect(queryStub).to.have.callCount(1)
    })
  })

  describe('updateMailbox', () => {
    it('should pass in the correct sql and params', () => {
      const expectedUpdateClause = 'update notifications_config'
      const expectedSetClause = 'set email = $2, establishment = $3, role = $4, name = $5'
      const expectedWhereClause = 'where id = $1'

      const result = userProxy().updateMailbox(1, {
        email: 'email1',
        establishment: 'establishment1',
        role: 'role1',
        name: 'name1',
      })

      return result.then(() => {
        const call = queryStub.getCalls()[0].args[0]
        expect(call.text).includes(expectedUpdateClause)
        expect(call.text).includes(expectedSetClause)
        expect(call.text).includes(expectedWhereClause)
        expect(call.values).to.eql([1, 'email1', 'establishment1', 'role1', 'name1'])
      })
    })
  })

  describe('deleteMailbox', () => {
    it('should pass in the correct sql and params', () => {
      const expectedClause = 'delete from notifications_config where id = $1'

      const result = userProxy().deleteMailbox('1')

      return result.then(() => {
        const call = queryStub.getCalls()[0].args[0]
        expect(call.text).includes(expectedClause)
        expect(call.values).to.eql(['1'])
      })
    })
  })

  describe('addMailbox', () => {
    it('should pass in the correct sql and params', () => {
      const expectedInsertClause = 'insert into notifications_config'
      const expectedColsClause = '(email, establishment, role, name)'
      const expectedValuesClause = 'values($1, $2, $3, $4)'

      const result = userProxy().addMailbox({
        email: 'email1',
        establishment: 'establishment1',
        role: 'role1',
        name: 'name1',
      })

      return result.then(() => {
        const call = queryStub.getCalls()[0].args[0]
        expect(call.text).includes(expectedInsertClause)
        expect(call.text).includes(expectedColsClause)
        expect(call.text).includes(expectedValuesClause)
        expect(call.values).to.eql(['email1', 'establishment1', 'role1', 'name1'])
      })
    })
  })

  describe('getJobSpec', () => {
    it('should pass in the correct params', () => {
      const result = userProxy().getJobSpec('name')
      return result.then(() => {
        const call = queryStub.getCalls()[0].args[0]
        expect(call.values).to.eql(['name'])
      })
    })
  })

  describe('setJobSpec', () => {
    it('should pass in the correct params', () => {
      const result = userProxy().setJobSpec('name', 'spec')
      return result.then(() => {
        const call = queryStub.getCalls()[0].args[0]
        expect(call.values).to.eql(['name', 'spec'])
      })
    })
  })
})
