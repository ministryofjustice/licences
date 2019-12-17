const proxyquire = require('proxyquire')

proxyquire.noCallThru()

describe('warningClient', () => {
  let queryStub

  const warningClientProxy = (query = queryStub) => {
    return proxyquire('../../server/data/warningClient', {
      './dataAccess/db': {
        query,
      },
    })
  }

  beforeEach(() => {
    queryStub = sinon.stub()
  })

  describe('raiseWarning', () => {
    it('should pass in the correct sql', () => {
      const expectedInsert = `INSERT INTO warnings (booking_id, code, message, acknowledged) VALUES ($1, $2, $3, false) 
      ON CONFLICT (booking_id, code) where acknowledged = false DO NOTHING`

      const result = warningClientProxy().raiseWarning(1, 'code-1', 'messsage-1')

      return result.then(() => {
        const { text, values } = queryStub.getCalls()[0].args[0]
        expect(text).to.include(expectedInsert)
        expect(values).to.eql([1, 'code-1', 'messsage-1'])
      })
    })
  })

  describe('acknowledgeWarnings', () => {
    it('should pass in the correct sql', async () => {
      queryStub = sinon.stub().resolves({ rowCount: 2 })
      const expectedInsert = "UPDATE warnings SET acknowledged = true WHERE id in ('1','2')"

      await warningClientProxy().acknowledgeWarnings([1, 2])

      const { text } = queryStub.getCalls()[0].args[0]
      expect(text).to.include(expectedInsert)
    })

    it('should return modified row count', async () => {
      queryStub = sinon.stub().resolves({ rowCount: 2 })
      const result = await warningClientProxy().acknowledgeWarnings([1, 2])
      expect(result).to.eql(2)
    })
  })

  describe('getAcknowledgedWarnings', () => {
    it('should pass in the correct sql', async () => {
      queryStub = sinon.stub().resolves({ rows: [{ count: 1 }] })

      await warningClientProxy().getAcknowledgedWarnings()

      const { text, values } = queryStub.getCalls()[0].args[0]
      expect(text).to.eql(`SELECT id
      ,      booking_id "bookingId"
      ,      timestamp 
      ,      code
      ,      message
      FROM warnings   
      where acknowledged = true
      ORDER BY timestamp DESC
      LIMIT 500`)
      expect(values).to.eql(undefined)
    })
  })

  describe('getOutstandingWarnings', () => {
    it('should pass in the correct sql', async () => {
      queryStub = sinon.stub().resolves({ rows: [{ count: 1 }] })

      await warningClientProxy().getOutstandingWarnings()

      const { text, values } = queryStub.getCalls()[0].args[0]
      expect(text).to.eql(`SELECT id
      ,      booking_id "bookingId"
      ,      timestamp 
      ,      code
      ,      message
      FROM warnings   
      where acknowledged = false
      ORDER BY timestamp DESC
      LIMIT 500`)
      expect(values).to.eql(undefined)
    })
  })
})
