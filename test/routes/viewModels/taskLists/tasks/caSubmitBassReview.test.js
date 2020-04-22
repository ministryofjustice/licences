const caSubmitBassReview = require('../../../../../server/routes/viewModels/taskLists/tasks/caSubmitBassReview')

describe('ca submit for bass review task', () => {
  test('should show submission unavailable if opted out', () => {
    expect(
      caSubmitBassReview({
        decisions: { optedOut: true },
        tasks: {},
        visible: true,
      })
    ).toStrictEqual({
      action: null,
      label: 'Submission unavailable - Offender has opted out of HDC',
      title: 'Send for BASS area checks',
      visible: true,
    })
  })

  test('should return Ready to submit if task DONE', () => {
    expect(
      caSubmitBassReview({
        decisions: { optedOut: false },
        tasks: { bassRequest: 'DONE' },
        visible: true,
      })
    ).toStrictEqual({
      action: { dataQa: 'continue', href: '/hdc/review/bassRequest/', text: 'Continue', type: 'btn' },
      label: 'Ready to submit',
      title: 'Send for BASS area checks',
      visible: true,
    })
  })

  test('should allow reviewing if task STARTED', () => {
    expect(
      caSubmitBassReview({
        decisions: { optedOut: false },
        tasks: { bassRequest: 'STARTED' },
        visible: true,
      })
    ).toStrictEqual({
      action: { dataQa: 'continue', href: '/hdc/review/bassRequest/', text: 'Continue', type: 'btn' },
      label: 'Ready to submit',
      title: 'Send for BASS area checks',
      visible: true,
    })
  })

  test('should show not completed and have no action if not DONE or STARTED', () => {
    expect(
      caSubmitBassReview({
        decisions: { optedOut: false },
        tasks: { bassRequest: 'SOMETHING' },
        visible: true,
      })
    ).toStrictEqual({ action: null, label: 'Not completed', title: 'Send for BASS area checks', visible: true })
  })
})
