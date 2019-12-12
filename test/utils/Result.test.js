const Result = require('../../server/utils/Result')

describe('Result', () => {
  it('builds Success', () => {
    expect(Result.Success('a').isSuccess()).to.eql(true)
  })

  it('builds Fail', () => {
    expect(Result.Fail('error').isSuccess()).to.eql(false)
  })

  it('Success has a value', () => {
    expect(Result.Success('a').success()).to.eql('a')
  })

  it('Success has no error', () => {
    expect(() => Result.Success('a').fail()).to.throw()
  })

  it('Fail has no value', () => {
    expect(() => Result.Fail('a').success()).to.throw()
  })

  it('Fail has an error', () => {
    expect(Result.Fail('error').fail()).to.eql('error')
  })

  it('mapping Success yields Success', () => {
    expect(
      Result.Success('a')
        .map(v => v + v)
        .isSuccess()
    ).to.eql(true)
  })

  it('mapping a Success', () => {
    expect(
      Result.Success('a')
        .map(v => v + v)
        .success()
    ).to.eql('aa')
  })

  it('async mapping a Success', async () => {
    const result = await Result.Success('a').mapAsync(async v => v + v)
    expect(result.success()).to.eql('aa')
  })

  it('async mapping a Failure', async () => {
    const result = await Result.Fail('a').mapAsync(async v => v + v)
    expect(result.fail()).to.eql('a')
  })

  it('Success.orElseTryAsync', async () => {
    const result = await Result.Success('a').orElseTryAsync(() => Result.Success('b'))
    expect(result.isSuccess()).to.eql(true)
    expect(result.success()).to.eql('a')
  })

  it('Fail.orElse -> Success', async () => {
    const result = await Result.Fail('error').orElseTryAsync(() => Result.Success('b'))
    expect(result.isSuccess()).to.eql(true)
    expect(result.success()).to.eql('b')
  })

  it('Fail.orElse -> Success', async () => {
    const result = await Result.Fail('error1').orElseTryAsync(() => Result.Fail('error2'))
    expect(result.isSuccess()).to.eql(false)
    expect(result.fail()).to.eql('error2')
  })

  it('flatMap Success -> Success', () => {
    const result = Result.Success('a').flatMap(value => Result.Success(value + value))
    expect(result.success()).to.eql('aa')
    expect(result.isSuccess()).to.eql(true)
  })

  it('flatMap Success -> Fail', () => {
    const result = Result.Success('a').flatMap(value => Result.Fail(`error: ${value}`))
    expect(result.fail()).to.eql('error: a')
    expect(result.isSuccess()).to.eql(false)
  })

  it('mapping a Fail yields Fail', () => {
    expect(
      Result.Fail('a')
        .map(v => v + v)
        .isSuccess()
    ).to.eql(false)
  })

  it('mapping a Fail', () => {
    expect(
      Result.Fail('error')
        .map(x => x + x)
        .fail()
    ).to.eql('error')
  })

  it('flatMap Fail', () => {
    const result = Result.Fail('error').flatMap(value => Result.Success(value + value))

    expect(result.fail()).to.eql('error')
    expect(result.isSuccess()).to.eql(false)
  })

  it('match Success', () => {
    expect(Result.Success('a').match(v => v + v, () => 'fail')).to.eql('aa')
  })

  it('match Fail', () => {
    expect(Result.Fail('a').match(v => v + v, e => `fail: ${e}`)).to.eql('fail: a')
  })
})
