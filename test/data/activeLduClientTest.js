const proxyquire = require('proxyquire')

proxyquire.noCallThru()

describe('Save and retrieve LDU codes', () => {
  let queryStub

  const lduCode = 'ABCDE'

  const lduProxy = (query = queryStub) => {
    return proxyquire('../../server/data/activeLduClient', {
      './dataAccess/db': {
        query,
      },
    })
  }

  beforeEach(() => {
    queryStub = sinon.stub()
  })

  describe('addLdu', () => {
    it('should pass in the correct sql', () => {
      const expectedInsert = `INSERT INTO active_local_delivery_units (ldu_code) VALUES ($1) 
      ON CONFLICT (ldu_code) DO NOTHING`

      const result = lduProxy().addLdu(lduCode)

      return result.then(() => {
        const sql = queryStub.getCalls()[0].args[0].text
        expect(sql).to.include(expectedInsert)
      })
    })

    it('should pass in the correct parameter', () => {
      const expectedParameter = [lduCode]

      const result = lduProxy().addLdu(lduCode)

      return result.then(() => {
        const { values } = queryStub.getCalls()[0].args[0]
        expect(values).to.eql(expectedParameter)
      })
    })
  })

  describe('isLduPresent', () => {
    it('should pass in the correct sql', () => {
      queryStub = sinon.stub().resolves({ rows: [{ count: 1 }] })
      const expectedSelect = 'SELECT count(*) FROM active_local_delivery_units'
      const expectedWhere = 'WHERE ldu_code=$1'
      const result = lduProxy().isLduPresent(lduCode)

      return result.then(() => {
        const sql = queryStub.getCalls()[0].args[0].text
        expect(sql).to.include(expectedSelect)
        expect(sql).to.include(expectedWhere)
      })
    })

    it('should pass in the correct parameter', () => {
      queryStub = sinon.stub().resolves({ rows: [{ count: 1 }] })
      const expectedParameter = [lduCode]
      const result = lduProxy().isLduPresent(lduCode)

      return result.then(() => {
        const { values } = queryStub.getCalls()[0].args[0]
        expect(values).to.eql(expectedParameter)
      })
    })

    it('should return true if ldu is present', async () => {
      queryStub = sinon.stub().resolves({ rows: [{ count: 1 }] })
      const result = await lduProxy().isLduPresent(lduCode)
      expect(result).to.eql(true)
    })

    it('should return false if ldu is not present', async () => {
      queryStub = sinon.stub().resolves({ rows: [{ count: 0 }] })

      const result = await lduProxy().isLduPresent()
      expect(result).to.eql(false)
    })
  })
})
