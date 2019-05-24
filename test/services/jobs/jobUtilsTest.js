const createJobUtils = require('../../../server/services/jobs/jobUtils')

describe('jobUtils', () => {
  let jobFunction
  let callback
  let dbLockingClient
  let jobUtils

  beforeEach(() => {
    jobFunction = sinon.stub().returns('job result')
    dbLockingClient = {
      tryLock: sinon.stub().resolves(true),
      unlock: sinon.stub().resolves(true),
    }
    callback = sinon.stub().returns()

    jobUtils = createJobUtils(dbLockingClient)
  })

  it('should lock, execute, unlock', async () => {
    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(dbLockingClient.tryLock).to.be.calledOnce()
    expect(dbLockingClient.unlock).to.be.calledOnce()
    expect(jobFunction).to.be.calledOnce()
    expect(dbLockingClient.tryLock).to.be.calledWith('name')
    expect(dbLockingClient.unlock).to.be.calledWith('name')
  })

  it('should not execute without lock', async () => {
    dbLockingClient.tryLock = sinon.stub().resolves(false)

    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(dbLockingClient.tryLock).to.be.calledOnce()
    expect(dbLockingClient.unlock).to.be.calledOnce()
    expect(jobFunction).not.to.be.calledOnce()
  })

  it('should unlock if function throws', async () => {
    jobFunction = sinon.stub().throws()

    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(dbLockingClient.tryLock).to.be.calledOnce()
    expect(dbLockingClient.unlock).to.be.calledOnce()
    expect(jobFunction).to.be.calledOnce()
  })

  it('should call callback on success', async () => {
    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(callback).to.be.calledOnce()
    expect(callback).to.be.calledWith(null, 'job result')
  })

  it('should call callback on missed lock', async () => {
    dbLockingClient.tryLock = sinon.stub().resolves(false)

    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(callback).to.be.calledOnce()
    expect(callback).to.be.calledWith(null, 'MISSED_LOCK')
  })

  it('should call callback on job function error', async () => {
    jobFunction = sinon.stub().throws({ message: 'DEAD' })

    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(callback).to.be.calledOnce()
    expect(callback).to.be.calledWith({ message: 'DEAD' }, null)
  })

  it('should call callback on lock error', async () => {
    dbLockingClient.tryLock = sinon
      .stub()
      .onCall(0)
      .rejects({ message: 'DEAD' })

    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(callback).to.be.calledOnce()
    expect(callback).to.be.calledWith({ message: 'DEAD' }, null)
  })
})
