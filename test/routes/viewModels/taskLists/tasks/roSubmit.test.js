const { getLabel, getRoAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/roSubmit')

describe('victim liaison task', () => {
  describe('getLabel', () => {
    test('should return Ready to submit if transition is allowed', () => {
      expect(getLabel({ allowedTransition: 'roToCa' })).toBe('Ready to submit')
    })

    test('should return Tasks not yet complete if transition is not allowed', () => {
      expect(getLabel({ allowedTransition: 'something' })).toBe('Tasks not yet complete')
    })
  })

  describe('getRoAction', () => {
    test('should show btn to curfewAddressReview if curfewAddressReview: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/send/optedOut/',
        type: 'btn',
        dataQa: 'continue',
      })
    })

    test('should show change link to curfewAddressReview if curfewAddressReview: DONE', () => {
      expect(
        getRoAction({
          decisions: { optedOut: false },
          tasks: {},
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/review/licenceDetails/',
        type: 'btn',
        dataQa: 'continue',
      })
    })
  })
})
