const { getLabel, getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/caSubmitApproval')

describe('ca submit for approval task', () => {
  describe('getLabel', () => {
    test('should return Ready to submit if allowedTransition = caToDm', () => {
      expect(
        getLabel({
          decisions: {},
          allowedTransition: 'caToDm',
        })
      ).toBe('Ready to submit')
    })

    test('should return Submission unavailable if postponed', () => {
      expect(
        getLabel({
          decisions: { postponed: true },
          allowedTransition: null,
        })
      ).toBe('Submission unavailable - HDC application postponed')
    })

    test('should return Submission unavailable - HDC refused to submit if finalChecksRefused', () => {
      expect(
        getLabel({
          allowedTransition: null,
          decisions: { postponed: false, finalChecksRefused: true },
        })
      ).toBe('Submission unavailable - HDC refused')
    })

    test('should return Not completed if not postponed or finalChecksRefused', () => {
      expect(
        getLabel({
          allowedTransition: null,
          decisions: { postponed: false, finalChecksRefused: false },
        })
      ).toBe('Not completed')
    })
  })

  describe('getCaAction', () => {
    test('should show nothing if opted out', () => {
      expect(
        getCaAction({
          allowedTransition: 'caToDm',
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/send/approval/',
        type: 'btn',
        dataQa: 'continue',
      })
    })

    test('should show Continue to bassRequest if task DONE', () => {
      expect(
        getCaAction({
          allowedTransition: 'something',
        })
      ).toBe(null)
    })
  })
})
