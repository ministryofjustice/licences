const { getRoNewCaseDueDate } = require('../../server/utils/dueDates')

describe('getRoNewCaseDueDate', () => {
  let clock

  afterEach(() => {
    clock.restore()
  })

  it('should add 10 working days if before 3pm', async () => {
    clock = sinon.useFakeTimers(new Date('March 11, 2019 14:59:59').getTime())
    expect(getRoNewCaseDueDate()).to.eql('Monday 25th March')
  })

  it('should add 11 working days if exactly 3pm', async () => {
    clock = sinon.useFakeTimers(new Date('March 11, 2019 15:00:00').getTime())
    expect(getRoNewCaseDueDate()).to.eql('Tuesday 26th March')
  })

  it('should add 11 working days if after 3pm', async () => {
    clock = sinon.useFakeTimers(new Date('March 11, 2019 15:00:01').getTime())
    expect(getRoNewCaseDueDate()).to.eql('Tuesday 26th March')
  })

  it('should recognise christmas day and boxing as bank holidays', async () => {
    clock = sinon.useFakeTimers(new Date('December 10, 2019 14:59:59').getTime())
    expect(getRoNewCaseDueDate()).to.eql('Tuesday 24th December')

    clock = sinon.useFakeTimers(new Date('December 11, 2019 14:59:59').getTime())
    expect(getRoNewCaseDueDate()).to.eql('Friday 27th December')
  })

  it('should recognise good friday and easter monday as bank holidays', async () => {
    clock = sinon.useFakeTimers(new Date('March 26, 2020 14:59:59').getTime())
    expect(getRoNewCaseDueDate()).to.eql('Thursday 9th April')

    clock = sinon.useFakeTimers(new Date('March 27, 2020 14:59:59').getTime())
    expect(getRoNewCaseDueDate()).to.eql('Tuesday 14th April')
  })
})
