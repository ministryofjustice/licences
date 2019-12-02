const proxyquire = require('proxyquire')

proxyquire.noCallThru()

describe('Save and retrive LDU codes', () => {
  let queryStub

  const lduCode = 'ABCDE'

  const lduProxy = (query = queryStub) => {
    return proxyquire('../../server/data/activeLduClient', {
      './dataAccess/db': {
        query,
      },
    })
  }

  describe('doesLduExist', () => {
    it('should call query once', () => {
      queryStub = sinon.stub().resolves()
      lduProxy().doesLduExist(lduCode)
      expect(queryStub).to.have.callCount(1)
    })

    it('should return false if no matching lduCode', async () => {
      queryStub = sinon.stub().resolves({})
      const result = await lduProxy().doesLduExist('hello')
      expect(result).to.eql('false')
    })

    it('should return true if lduCode found', async () => {
      queryStub = sinon.stub().resolves({ rows: [{ lduCode }] })
      const result = await lduProxy().doesLduExist(lduCode)
      expect(result).to.eql('true')
    })
  })

  describe('addLdu', () => {
    it('should call query once', () => {
      queryStub = sinon.stub().resolves()
      lduProxy().addLdu(lduCode)
      expect(queryStub).to.have.callCount(1)
    })

    it('should return the LDU code if INSERT was successful', async () => {
      const expectedResult = lduCode
      queryStub = sinon.stub().resolves(expectedResult)
      const result = await lduProxy().addLdu(lduCode)
      expect(result).to.eql(expectedResult)
    })
  })
})
