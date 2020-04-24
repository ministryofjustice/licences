const roSubmit = require('../../../../../server/routes/viewModels/taskLists/tasks/roSubmit')

describe('victim liaison task', () => {
  describe('getLabel', () => {
    test('should return Ready to submit if transition is allowed', () => {
      expect(roSubmit({ allowedTransition: 'roToCa', decisions: {} }).label).toBe('Ready to submit')
    })

    test('should return Tasks not yet complete if transition is not allowed', () => {
      expect(roSubmit({ allowedTransition: 'something', decisions: {} }).label).toBe('Tasks not yet complete')
    })
  })

  describe('getRoAction', () => {
    test('should show btn to curfewAddressReview if curfewAddressReview: UNSTARTED', () => {
      expect(
        roSubmit({
          decisions: { optedOut: true },
          tasks: {},
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/send/optedOut/',
        type: 'btn',
        dataQa: 'continue',
      })
    })

    test('should show change link to curfewAddressReview if curfewAddressReview: DONE', () => {
      expect(
        roSubmit({
          decisions: { optedOut: false },
          tasks: {},
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/review/licenceDetails/',
        type: 'btn',
        dataQa: 'continue',
      })
    })
  })
})
