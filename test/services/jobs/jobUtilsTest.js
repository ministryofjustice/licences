const proxyquire = require('proxyquire')

proxyquire.noCallThru()

describe('jobUtils', () => {
  let jobFunction
  let queryStub
  let callback

  const proxy = (query = queryStub) => {
    return proxyquire('../../../server/services/jobs/jobUtils', {
      '../../data/dataAccess/db': {
        query,
      },
    })
  }

  beforeEach(() => {
    jobFunction = sinon.stub().returns('job result')
    queryStub = sinon.stub().resolves({ rows: [{ pg_try_advisory_lock: true }] })
    callback = sinon.stub().returns()
  })

  it('should lock, execute, unlock', async () => {
    const runner = proxy().onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(queryStub).to.be.calledTwice()
    expect(queryStub.getCalls()[0].args[0].text).includes('select pg_try_advisory_lock($1)')
    expect(queryStub.getCalls()[1].args[0].text).includes('select pg_advisory_unlock($1)')
    expect(jobFunction).to.be.calledOnce()
  })

  it('should not execute without lock', async () => {
    queryStub = sinon.stub().resolves({ rows: [{ pg_try_advisory_lock: false }] })

    const runner = proxy().onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(queryStub).to.be.calledTwice()
    expect(jobFunction).not.to.be.calledOnce()
  })

  it('should unlock if function throws', async () => {
    jobFunction = sinon.stub().throws()

    const runner = proxy().onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(queryStub).to.be.calledTwice()
    expect(queryStub.getCalls()[0].args[0].text).includes('select pg_try_advisory_lock($1)')
    expect(queryStub.getCalls()[1].args[0].text).includes('select pg_advisory_unlock($1)')
    expect(jobFunction).to.be.calledOnce()
  })

  it('should call callback on success', async () => {
    const runner = proxy().onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(callback).to.be.calledOnce()
    expect(callback).to.be.calledWith(null, 'job result')
  })

  it('should call callback on missed lock', async () => {
    queryStub = sinon.stub().resolves({ rows: [{ pg_try_advisory_lock: false }] })

    const runner = proxy().onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(callback).to.be.calledOnce()
    expect(callback).to.be.calledWith(null, 'MISSED_LOCK')
  })

  it('should call callback on job function error', async () => {
    jobFunction = sinon.stub().throws({ message: 'DEAD' })

    const runner = proxy().onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(callback).to.be.calledOnce()
    expect(callback).to.be.calledWith({ message: 'DEAD' }, null)
  })

  it('should call callback on lock error', async () => {
    queryStub = sinon
      .stub()
      .onCall(0)
      .rejects({ message: 'DEAD' })

    const runner = proxy().onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(callback).to.be.calledOnce()
    expect(callback).to.be.calledWith({ message: 'DEAD' }, null)
  })
})
