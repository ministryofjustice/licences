const { getLabel, getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/caSubmitBassReview')

describe('ca submit for bass review task', () => {
  describe('getLabel', () => {
    test('should Submission unavailable if opted out', () => {
      expect(
        getLabel({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).toBe('Submission unavailable - Offender has opted out of HDC')
    })

    test('should return Ready to submit if task DONE', () => {
      expect(
        getLabel({
          decisions: { optedOut: false },
          tasks: { bassRequest: 'DONE' },
        })
      ).toBe('Ready to submit')
    })

    test('should return Ready to submit if task STARTED', () => {
      expect(
        getLabel({
          decisions: { optedOut: false },
          tasks: { bassRequest: 'STARTED' },
        })
      ).toBe('Ready to submit')
    })

    test('should return Not completed if task not DONE or STARTED', () => {
      expect(
        getLabel({
          decisions: { optedOut: false },
          tasks: { bassRequest: 'SOMETHING' },
        })
      ).toBe('Not completed')
    })
  })

  describe('getCaAction', () => {
    test('should show nothing if opted out', () => {
      expect(
        getCaAction({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).toBe(null)
    })

    test('should show Continue to bassRequest if task DONE', () => {
      expect(
        getCaAction({
          decisions: { optedOut: false },
          tasks: { bassRequest: 'DONE' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/review/bassRequest/',
        type: 'btn',
      })
    })

    test('should show Continue to bassRequest if task STARTED', () => {
      expect(
        getCaAction({
          decisions: { optedOut: false },
          tasks: { bassRequest: 'STARTED' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/review/bassRequest/',
        type: 'btn',
      })
    })

    test('should show nothing if task not DONE or STARTED', () => {
      expect(
        getCaAction({
          decisions: { optedOut: false },
          tasks: { bassRequest: 'SOMETHING' },
        })
      ).toBe(null)
    })
  })
})
