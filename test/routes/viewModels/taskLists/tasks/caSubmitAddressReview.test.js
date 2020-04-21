const caSubmitAddressReview = require('../../../../../server/routes/viewModels/taskLists/tasks/caSubmitAddressReview')

describe('ca submit for address review task', () => {
  test('should show btn to curfewAddress if curfewAddress: DONE and not opted out', () => {
    expect(
      caSubmitAddressReview({
        decisions: { optedOut: false },
        tasks: { curfewAddress: 'DONE' },
        visible: true,
      })
    ).toStrictEqual({
      action: {
        dataQa: 'continue',
        href: '/hdc/review/curfewAddress/',
        text: 'Continue',
        type: 'btn',
      },
      label: 'Ready to submit',
      title: 'Submit curfew address',
      visible: true,
    })
  })

  test('should show nothing if curfewAddress: not DONE and not opted out', () => {
    expect(
      caSubmitAddressReview({
        decisions: { optedOut: false },
        tasks: { curfewAddress: 'SOMETHING' },
        visible: true,
      })
    ).toStrictEqual({ action: null, label: 'Not completed', title: 'Submit curfew address', visible: true })
  })

  test('should show nothing if opted out', () => {
    expect(
      caSubmitAddressReview({
        decisions: { optedOut: true },
        tasks: { curfewAddress: 'DONE' },
        visible: true,
      })
    ).toStrictEqual({ action: null, label: 'Ready to submit', title: 'Submit curfew address', visible: true })
  })
})
