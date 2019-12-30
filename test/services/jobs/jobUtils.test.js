const createJobUtils = require('../../../server/services/jobs/jobUtils')

describe('jobUtils', () => {
  let jobFunction
  let callback
  let dbLockingClient
  let jobUtils

  beforeEach(() => {
    jobFunction = jest.fn().mockReturnValue('job result')
    dbLockingClient = {
      tryLock: jest.fn().mockReturnValue(true),
      unlock: jest.fn().mockReturnValue(true),
    }
    callback = jest.fn().mockReturnValue()

    jobUtils = createJobUtils(dbLockingClient)
  })

  test('should lock, execute, unlock', async () => {
    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(dbLockingClient.tryLock).toHaveBeenCalled()
    expect(dbLockingClient.unlock).toHaveBeenCalled()
    expect(jobFunction).toHaveBeenCalled()
    expect(dbLockingClient.tryLock).toHaveBeenCalledWith('name')
    expect(dbLockingClient.unlock).toHaveBeenCalledWith('name')
  })

  test('should not execute without lock', async () => {
    dbLockingClient.tryLock = jest.fn().mockReturnValue(false)

    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(dbLockingClient.tryLock).toHaveBeenCalled()
    expect(dbLockingClient.unlock).toHaveBeenCalled()
    expect(jobFunction).not.toHaveBeenCalled()
  })

  test('should unlock if function throws', async () => {
    jobFunction = jest.fn().mockImplementation(() => {
      throw new Error()
    })

    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(dbLockingClient.tryLock).toHaveBeenCalled()
    expect(dbLockingClient.unlock).toHaveBeenCalled()
    expect(jobFunction).toHaveBeenCalled()
  })

  test('should call callback on success', async () => {
    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(callback).toHaveBeenCalled()
    expect(callback).toHaveBeenCalledWith(null, 'job result')
  })

  test('should call callback on missed lock', async () => {
    dbLockingClient.tryLock = jest.fn().mockReturnValue(false)

    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(callback).toHaveBeenCalled()
    expect(callback).toHaveBeenCalledWith(null, 'MISSED_LOCK')
  })

  test('should call callback on job function error', async () => {
    jobFunction = jest.fn().mockImplementation(() => {
      throw new Error('DEAD')
    })

    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(callback).toHaveBeenCalled()
    expect(callback).toHaveBeenCalledWith(Error('DEAD'), null)
  })

  test('should call callback on lock error', async () => {
    dbLockingClient.tryLock = jest.fn().mockRejectedValue({ message: 'DEAD' })

    const runner = jobUtils.onceOnly(jobFunction, 'name', 0, callback)
    await runner()

    expect(callback).toHaveBeenCalled()
    expect(callback).toHaveBeenCalledWith({ message: 'DEAD' }, null)
  })
})
