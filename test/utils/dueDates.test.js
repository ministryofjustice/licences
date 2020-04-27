const moment = require('moment')
const {
  getRoCaseDueDate,
  getRoNewCaseDueDate,
  getRoOverdueCasesDate,
  getRoDueCasesDates,
} = require('../../server/utils/dueDates')

describe('Due dates calcuations', () => {
  describe('specified time basis', () => {
    describe('getRoCaseDueDate', () => {
      test('should return null if input is missing', async () => {
        expect(getRoCaseDueDate()).toBe(null)
      })

      test('should return null if input is not a moment', async () => {
        expect(getRoCaseDueDate('2019-03-11 14:59:59')).toBe(null)
      })

      test('should add 10 working days if before 3pm', async () => {
        expect(getRoCaseDueDate(moment('2019-03-11 14:59:59'))).toBe('Monday 25th March')
      })

      test('should add 11 working days if 3pm or later', async () => {
        expect(getRoCaseDueDate(moment('2019-03-11 15:00:00'))).toBe('Tuesday 26th March')
      })
    })
  })

  describe('current time basis', () => {
    let realDateNow

    const nowIs = (val) => {
      const time = new Date(val)
      realDateNow = Date.now.bind(global.Date)
      jest.spyOn(Date, 'now').mockImplementation(() => time.getTime())
    }

    afterEach(() => {
      global.Date.now = realDateNow
    })

    describe('getRoNewCaseDueDate', () => {
      test('should add 10 working days if before 3pm', async () => {
        nowIs('March 11, 2019 14:59:59')
        expect(getRoNewCaseDueDate()).toBe('Monday 25th March')
      })

      test('should add 11 working days if exactly 3pm', async () => {
        nowIs('March 11, 2019 15:00:00')
        expect(getRoNewCaseDueDate()).toBe('Tuesday 26th March')
      })

      test('should add 11 working days if after 3pm', async () => {
        nowIs('March 11, 2019 15:00:01')
        expect(getRoNewCaseDueDate()).toBe('Tuesday 26th March')
      })

      test('should recognise christmas day and boxing as bank holidays', async () => {
        nowIs('December 10, 2019 14:59:59')
        expect(getRoNewCaseDueDate()).toBe('Tuesday 24th December')

        nowIs('December 11, 2019 14:59:59')
        expect(getRoNewCaseDueDate()).toBe('Friday 27th December')
      })

      test('should recognise good friday and easter monday as bank holidays', async () => {
        nowIs('March 26, 2020 14:59:59')
        expect(getRoNewCaseDueDate()).toBe('Thursday 9th April')

        nowIs('March 27, 2020 14:59:59')
        expect(getRoNewCaseDueDate()).toBe('Tuesday 14th April')
      })
    })

    describe('Due date calculations', () => {
      // For a case created april 5th post 15:00
      // (weekend in between)
      // or april 8th pre 15:00
      // then the due date (10 working days, 4 weekend days, 2 holidays) = 8+16 = april 24th

      describe('getRoDueCasesDates', () => {
        // if today is 18th, then anything from 15:00 on the 5th up to 14:59 on the 8th is due in 2 days
        describe('getRoDueCasesDates - due in 2 days', () => {
          test('Should account for weekends and holidays', async () => {
            nowIs('April 18, 2019 01:00:00')
            const range = getRoDueCasesDates(2)
            expect(range.from).toBe('2019-04-05 15:00:00')
            expect(range.upto).toBe('2019-04-08 14:59:59')
          })
        })

        // if today is 24th, then anything from 15:00 on the 5th up to 14:59 on the 8th is due today
        describe('getRoDueCasesDates - due today', () => {
          test('Should account for weekends and holidays', async () => {
            nowIs('April 24, 2019 01:00:00')
            const range = getRoDueCasesDates(0)
            expect(range.from).toBe('2019-04-05 15:00:00')
            expect(range.upto).toBe('2019-04-08 14:59:59')
          })
        })
      })

      describe('getRoOverdueCasesDate', () => {
        // if today is 25th, then anything before 15:00 on 8th is now overdue
        describe('getRoOverdueCasesDate', () => {
          test('Should account for weekends and holidays', async () => {
            nowIs('April 25, 2019 01:00:00')
            expect(getRoOverdueCasesDate()).toBe('2019-04-08 14:59:59')
          })
        })
      })
    })
  })
})
