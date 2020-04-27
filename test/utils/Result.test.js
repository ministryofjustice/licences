const Result = require('../../server/utils/Result')

describe('Result', () => {
  test('builds Success', () => {
    expect(Result.Success('a').isSuccess()).toBe(true)
  })

  test('builds Fail', () => {
    expect(Result.Fail('error').isSuccess()).toBe(false)
  })

  test('Success has a value', () => {
    expect(Result.Success('a').success()).toBe('a')
  })

  test('Success has no error', () => {
    expect(() => Result.Success('a').fail()).toThrowError()
  })

  test('Fail has no value', () => {
    expect(() => Result.Fail('a').success()).toThrowError()
  })

  test('Fail has an error', () => {
    expect(Result.Fail('error').fail()).toBe('error')
  })

  test('mapping Success yields Success', () => {
    expect(
      Result.Success('a')
        .map((v) => v + v)
        .isSuccess()
    ).toBe(true)
  })

  test('mapping a Success', () => {
    expect(
      Result.Success('a')
        .map((v) => v + v)
        .success()
    ).toBe('aa')
  })

  test('async mapping a Success', async () => {
    const result = await Result.Success('a').mapAsync(async (v) => v + v)
    expect(result.success()).toBe('aa')
  })

  test('async mapping a Failure', async () => {
    const result = await Result.Fail('a').mapAsync(async (v) => v + v)
    expect(result.fail()).toBe('a')
  })

  test('Success.orRecoverAsync', async () => {
    const resultP = Result.Success('a').orRecoverAsync(async () => Result.Success('a'))
    expect(resultP).toBeInstanceOf(Promise)
    const result = await resultP
    expect(result.isSuccess()).toBe(true)
    expect(result.success()).toBe('a')
  })

  test('Fail.orRecoverAsync -> Success', async () => {
    const resultP = Result.Fail('error').orRecoverAsync(async () => Result.Success('b'))
    expect(resultP).toBeInstanceOf(Promise)
    const result = await resultP
    expect(result.isSuccess()).toBe(true)
    expect(result.success()).toBe('b')
  })

  test('Fail.orRecoverAsync -> Success', async () => {
    const resultP = Result.Fail('error1').orRecoverAsync(async () => Result.Fail('error2'))
    expect(resultP).toBeInstanceOf(Promise)
    const result = await resultP
    expect(result.isSuccess()).toBe(false)
    expect(result.fail()).toBe('error2')
  })

  test('flatMap Success -> Success', () => {
    const result = Result.Success('a').flatMap((value) => Result.Success(value + value))
    expect(result.success()).toBe('aa')
    expect(result.isSuccess()).toBe(true)
  })

  test('flatMap Success -> Fail', () => {
    const result = Result.Success('a').flatMap((value) => Result.Fail(`error: ${value}`))
    expect(result.fail()).toBe('error: a')
    expect(result.isSuccess()).toBe(false)
  })

  test('mapping a Fail yields Fail', () => {
    expect(
      Result.Fail('a')
        .map((v) => v + v)
        .isSuccess()
    ).toBe(false)
  })

  test('mapping a Fail', () => {
    expect(
      Result.Fail('error')
        .map((x) => x + x)
        .fail()
    ).toBe('error')
  })

  test('flatMap Fail', () => {
    const result = Result.Fail('error').flatMap((value) => Result.Success(value + value))

    expect(result.fail()).toBe('error')
    expect(result.isSuccess()).toBe(false)
  })

  test('match Success', () => {
    expect(
      Result.Success('a').match(
        (v) => v + v,
        () => 'fail'
      )
    ).toBe('aa')
  })

  test('match Fail', () => {
    expect(
      Result.Fail('a').match(
        (v) => v + v,
        (e) => `fail: ${e}`
      )
    ).toBe('fail: a')
  })
})
