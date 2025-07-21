import { Success, Fail } from '../../server/utils/Result'

describe('Result', () => {
  test('builds Success', () => {
    expect(Success('a').isSuccess()).toBe(true)
  })

  test('builds Fail', () => {
    expect(Fail('error').isSuccess()).toBe(false)
  })

  test('Success has a value', () => {
    expect(Success('a').success()).toBe('a')
  })

  test('Success has no error', () => {
    expect(() => Success('a').fail()).toThrow()
  })

  test('Fail has no value', () => {
    expect(() => Fail('a').success()).toThrow()
  })

  test('Fail has an error', () => {
    expect(Fail('error').fail()).toBe('error')
  })

  test('mapping Success yields Success', () => {
    expect(
      Success('a')
        .map((v) => v + v)
        .isSuccess()
    ).toBe(true)
  })

  test('mapping a Success', () => {
    expect(
      Success('a')
        .map((v) => v + v)
        .success()
    ).toBe('aa')
  })

  test('async mapping a Success', async () => {
    const result = await Success('a').mapAsync(async (v) => v + v)
    expect(result.success()).toBe('aa')
  })

  test('async mapping a Failure', async () => {
    const result = await Fail<number, string>('a').mapAsync(async (v) => v + v)
    expect(result.fail()).toBe('a')
  })

  test('Success.orRecoverAsync', async () => {
    const resultP = Success('a').orRecoverAsync(async () => Success('a'))
    expect(resultP).toBeInstanceOf(Promise)
    const result = await resultP
    expect(result.isSuccess()).toBe(true)
    expect(result.success()).toBe('a')
  })

  test('Fail.orRecoverAsync -> Success', async () => {
    const resultP = Fail('error').orRecoverAsync(async () => Success('b'))
    expect(resultP).toBeInstanceOf(Promise)
    const result = await resultP
    expect(result.isSuccess()).toBe(true)
    expect(result.success()).toBe('b')
  })

  test('Fail.orRecoverAsync -> Success', async () => {
    const resultP = Fail('error1').orRecoverAsync(async () => Fail('error2'))
    expect(resultP).toBeInstanceOf(Promise)
    const result = await resultP
    expect(result.isSuccess()).toBe(false)
    expect(result.fail()).toBe('error2')
  })

  test('flatMap Success -> Success', () => {
    const result = Success('a').flatMap((value) => Success(value + value))
    expect(result.success()).toBe('aa')
    expect(result.isSuccess()).toBe(true)
  })

  test('flatMap Success -> Fail', () => {
    const result = Success('a').flatMap((value) => Fail(`error: ${value}`))
    expect(result.fail()).toBe('error: a')
    expect(result.isSuccess()).toBe(false)
  })

  test('mapping a Fail yields Fail', () => {
    expect(
      Fail<number, string>('a')
        .map((v) => v + v)
        .isSuccess()
    ).toBe(false)
  })

  test('mapping a Fail', () => {
    expect(
      Fail<number, string>('error')
        .map((x) => x + x)
        .fail()
    ).toBe('error')
  })

  test('flatMap Fail', () => {
    const result = Fail<number, string>('error').flatMap((value) => Success(value + value))

    expect(result.fail()).toBe('error')
    expect(result.isSuccess()).toBe(false)
  })

  test('match Success', () => {
    expect(
      Success('a').match(
        (v) => v + v,
        () => 'fail'
      )
    ).toBe('aa')
  })

  test('match Fail', () => {
    expect(
      Fail<number, boolean>(false).match<string>(
        (v) => `${v + v}`,
        (e) => (e ? 'fail: T' : 'fail: F')
      )
    ).toBe('fail: F')
  })
})
