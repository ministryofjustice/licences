const caSubmitBassReview = require('../../../../../../server/routes/viewModels/taskLists/tasks/ca/submitBassReview')

describe('ca submit for bass review task', () => {
  test('should show submission unavailable if opted out', () => {
    expect(
      caSubmitBassReview({
        decisions: { optedOut: true },
        tasks: {},
      })
    ).toStrictEqual({
      action: null,
      label: 'Submission unavailable - Offender has opted out of HDC',
      title: 'Send for CAS2 area checks',
    })
  })

  test('should return Ready to submit if task DONE', () => {
    expect(
      caSubmitBassReview({
        decisions: { optedOut: false },
        tasks: { bassRequest: 'DONE' },
      })
    ).toStrictEqual({
      action: { dataQa: 'continue', href: '/hdc/review/bassRequest/', text: 'Continue', type: 'btn' },
      label: 'Ready to submit',
      title: 'Send for CAS2 area checks',
    })
  })

  test('should allow reviewing if task STARTED', () => {
    expect(
      caSubmitBassReview({
        decisions: { optedOut: false },
        tasks: { bassRequest: 'STARTED' },
      })
    ).toStrictEqual({
      action: { dataQa: 'continue', href: '/hdc/review/bassRequest/', text: 'Continue', type: 'btn' },
      label: 'Ready to submit',
      title: 'Send for CAS2 area checks',
    })
  })

  test('should show not completed and have no action if not DONE or STARTED', () => {
    expect(
      caSubmitBassReview({
        decisions: { optedOut: false },
        tasks: { bassRequest: 'SOMETHING' },
      })
    ).toStrictEqual({ action: null, label: 'Not completed', title: 'Send for CAS2 area checks' })
  })
})
