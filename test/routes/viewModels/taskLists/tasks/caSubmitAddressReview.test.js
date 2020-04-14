const {
  getLabel,
  getCaAction,
} = require('../../../../../server/routes/viewModels/taskLists/tasks/caSubmitAddressReview')

describe('ca submit for address review task', () => {
  describe('getLabel', () => {
    test('should return Ready to submit if task DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { curfewAddress: 'DONE' },
        })
      ).toBe('Ready to submit')
    })

    test('should return Not completed if task not DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { curfewAddress: 'SOMETHING' },
        })
      ).toBe('Not completed')
    })
  })

  describe('getCaAction', () => {
    test('should show btn to curfewAddress if curfewAddress: DONE and not opted out', () => {
      expect(
        getCaAction({
          decisions: { optedOut: false },
          tasks: { curfewAddress: 'DONE' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/review/curfewAddress/',
        type: 'btn',
        dataQa: 'continue',
      })
    })

    test('should show nothing if curfewAddress: not DONE and not opted out', () => {
      expect(
        getCaAction({
          decisions: { optedOut: false },
          tasks: { curfewAddress: 'SOMETHING' },
        })
      ).toBe(null)
    })

    test('should show nothing if  opted out', () => {
      expect(
        getCaAction({
          decisions: { optedOut: true },
          tasks: { curfewAddress: 'DONE' },
        })
      ).toBe(null)
    })
  })
})
