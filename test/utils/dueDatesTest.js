const moment = require('moment')
const {
  getRoCaseDueDate,
  getRoNewCaseDueDate,
  getRoOverdueCasesDate,
  getRoDueCasesDates,
} = require('../../server/utils/dueDates')

describe('Due dates calcuations', () => {
  context('specified time basis', () => {
    describe('getRoCaseDueDate', () => {
      it('should return null if input is not a moment', async () => {
        expect(getRoCaseDueDate('2019-03-11 14:59:59')).to.eql(null)
      })

      it('should add 10 working days if before 3pm', async () => {
        expect(getRoCaseDueDate(moment('2019-03-11 14:59:59'))).to.eql('Monday 25th March')
      })

      it('should add 11 working days if 3pm or later', async () => {
        expect(getRoCaseDueDate(moment('2019-03-11 15:00:00'))).to.eql('Tuesday 26th March')
      })
    })
  })

  context('current time basis', () => {
    describe('getRoNewCaseDueDate', () => {
      let clock

      afterEach(() => {
        clock.restore()
      })

      describe('getRoNewCaseDueDate', () => {
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

      describe('due date calculations', () => {
        // created april 5th post 15:00
        // (weekend in between)
        // or april 8th pre 15:00
        // then due date (10 working days, 4 weekend days, 2 holidays) = 8+16 = april 24th

        // if today is 18th, then anything from 15:00 on the 5th up to 14:59 on the 8th is due in 2 days
        describe('getRoDueDateRange - due in 2 days', () => {
          it('Should account for weekends and holidays', async () => {
            clock = sinon.useFakeTimers(new Date('April 18, 2019 01:00:00').getTime())
            const range = getRoDueCasesDates(2)
            expect(range.from).to.eql('2019-04-05 15:00:00')
            expect(range.upto).to.eql('2019-04-08 14:59:59')
          })
        })

        // if today is 24th, then anything from 15:00 on the 5th up to 14:59 on the 8th is due today
        describe('getRoDueDateRange - due today', () => {
          it('Should account for weekends and holidays', async () => {
            clock = sinon.useFakeTimers(new Date('April 24, 2019 01:00:00').getTime())
            const range = getRoDueCasesDates(0)
            expect(range.from).to.eql('2019-04-05 15:00:00')
            expect(range.upto).to.eql('2019-04-08 14:59:59')
          })
        })

        // if today is 25th, then anything before 15:00 on 8th is now overdue
        describe('getRoCaseDateOverdue', () => {
          it('Should account for weekends and holidays', async () => {
            clock = sinon.useFakeTimers(new Date('April 25, 2019 01:00:00').getTime())
            expect(getRoOverdueCasesDate()).to.eql('2019-04-08 14:59:59')
          })
        })
      })
    })
  })
})
