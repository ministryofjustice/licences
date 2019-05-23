const hash = require('string-hash')
const proxyquire = require('proxyquire')

proxyquire.noCallThru()

describe('dbLockingClient', () => {
  let queryStub
  const nameHash = hash('name')

  const standardResponse = { rows: [] }
  const dbLockingClientProxy = (query = queryStub) => {
    return proxyquire('../../server/data/dbLockingClient', {
      './dataAccess/db': {
        query,
      },
    })
  }

  beforeEach(() => {
    queryStub = sinon.stub().resolves(standardResponse)
  })

  describe('tryLock', () => {
    it('should call query', () => {
      dbLockingClientProxy().tryLock('name')
      expect(queryStub).to.have.callCount(1)
      expect(queryStub.getCalls()[0].args[0].values).includes(nameHash)
    })
  })

  describe('unlock', () => {
    it('should call query', () => {
      dbLockingClientProxy().unlock('name')
      expect(queryStub).to.have.callCount(1)
      expect(queryStub.getCalls()[0].args[0].values).includes(nameHash)
    })
  })
})
