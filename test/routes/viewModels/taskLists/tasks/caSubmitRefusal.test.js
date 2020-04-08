const { getLabel, getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/caSubmitRefusal')

describe('ca submit for address review task', () => {
  describe('getLabel', () => {
    test('should Submission unavailable if opted out', () => {
      expect(
        getLabel({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).toBe('Submission unavailable - Offender has opted out of HDC')
    })

    test('should Ready to submit if not opted out', () => {
      expect(
        getLabel({
          decisions: { optedOut: false },
          tasks: {},
        })
      ).toBe('Ready to submit for refusal')
    })
  })

  describe('getCaAction', () => {
    test('should show btn to refusal if not opted out', () => {
      expect(
        getCaAction({
          decisions: { optedOut: false },
          tasks: {},
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/send/refusal/',
        type: 'btn',
        dataQa: 'continue',
      })
    })

    test('should show nothing if opted out', () => {
      expect(
        getCaAction({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).toBe(null)
    })
  })
})
