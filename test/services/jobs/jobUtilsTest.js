const { onceOnly } = require('../../../server/services/jobs/jobUtils')

describe('jobUtils', () => {
  let jobFunction
  let jobLock

  beforeEach(() => {
    jobFunction = sinon.stub().returns(true)
    jobLock = {
      tryLock: sinon.stub().returns(true),
      unlock: sinon.stub().returns(),
    }
  })

  it('should lock, execute, unlock', async () => {
    const runner = onceOnly(jobFunction, jobLock, 'name', 0)
    await runner()

    expect(jobLock.tryLock).to.be.calledOnce()
    expect(jobFunction).to.be.calledOnce()
    expect(jobLock.unlock).to.be.calledOnce()
  })

  it('should not execute without lock', async () => {
    jobLock = {
      tryLock: sinon.stub().returns(false),
      unlock: sinon.stub().returns(),
    }

    const runner = onceOnly(jobFunction, jobLock, 'name', 0)
    await runner()

    expect(jobLock.tryLock).to.be.calledOnce()
    expect(jobFunction).not.to.be.calledOnce()
    expect(jobLock.unlock).not.to.be.calledOnce()
  })

  it('should unlock if function throws', async () => {
    jobFunction = sinon.stub().throws()

    const runner = onceOnly(jobFunction, jobLock, 'name', 0)
    await runner()

    expect(jobLock.tryLock).to.be.calledOnce()
    expect(jobFunction).to.be.calledOnce()
    expect(jobLock.unlock).to.be.calledOnce()
  })
})
