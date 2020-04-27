const { getBassState, getBassAreaState, getBassRequestState } = require('../../server/utils/bassAddressState')
const { taskStates } = require('../../server/services/config/taskStates')

describe('bass', () => {
  test('should show bassWithdrawn when current request empty and last request withdrawn', () => {
    const licence = {
      proposedAddress: {
        addressProposed: {
          decision: 'No',
        },
      },
      bassReferral: {
        bassRequest: {
          bassRequested: 'Yes',
          specificArea: 'Yes',
        },
      },
      bassRejections: [
        {
          withdrawal: 'withdrawal reason',
          bassRequest: 'withdrawn request',
        },
      ],
    }

    const state = getBassState(licence)

    expect(state.bassWithdrawn).toBe(true)
    expect(state.bassWithdrawalReason).toBe('withdrawal reason')
  })

  test('should not show bassWithdrawn when current request not empty and last request withdrawn', () => {
    const licence = {
      proposedAddress: {
        addressProposed: {
          decision: 'No',
        },
      },
      bassReferral: {
        bassRequest: {
          bassRequested: 'Yes',
          proposedTown: 'not withdrawn',
        },
      },
      bassRejections: [
        {
          withdrawal: 'withdrawal reason',
          bassRequest: 'withdrawn request',
        },
      ],
    }

    const state = getBassState(licence)

    expect(state.bassWithdrawn).toBe(false)
  })

  test('should not show bassWithdrawn when last request not withdrawn', () => {
    const licence = {
      proposedAddress: {
        addressProposed: {
          decision: 'No',
        },
      },
      bassReferral: {
        bassRequest: {
          bassRequested: 'Yes',
        },
      },
      bassRejections: [
        {
          bassRequest: 'withdrawn request',
        },
      ],
    }

    const state = getBassState(licence)

    expect(state.bassWithdrawn).toBe(false)
  })

  test('should show bassAreaCheck done for no specific are only when seen by RO', () => {
    const licence = {
      proposedAddress: {
        addressProposed: {
          decision: 'No',
        },
      },
      bassReferral: {
        bassRequest: {
          bassRequested: 'Yes',
          specificArea: 'No',
        },
        bassAreaCheck: {
          bassAreaCheckSeen: 'true',
        },
      },
    }

    const state = getBassAreaState(licence)

    expect(state.bassAreaCheck).toBe(taskStates.DONE)
  })

  test('should show bassAreaCheck unstarted for no specific are only when not seen by RO', () => {
    const licence = {
      proposedAddress: {
        addressProposed: {
          decision: 'No',
        },
      },
      bassReferral: {
        bassRequest: {
          bassRequested: 'Yes',
          specificArea: 'No',
        },
        bassAreaCheck: {
          bassAreaCheckSeen: '',
        },
      },
    }

    const state = getBassAreaState(licence)

    expect(state.bassAreaCheck).toBe(taskStates.UNSTARTED)
  })

  describe('bassRequest task', () => {
    const examples = [
      {
        description: 'Specific area No',
        bassRequest: {
          bassRequested: 'Yes',
          specificArea: 'No',
        },
        outcome: taskStates.DONE,
      },
      {
        description: 'Specific area Yes',
        bassRequest: {
          bassRequested: 'Yes',
          specificArea: 'Yes',
        },
        outcome: taskStates.UNSTARTED,
      },
      {
        description: 'Specific area unanswered',
        bassRequest: {
          bassRequested: 'Yes',
        },
        outcome: taskStates.UNSTARTED,
      },
      {
        description: 'Specific area Yes with partial answers',
        bassRequest: {
          bassRequested: 'Yes',
          specificArea: 'Yes',
          proposedCounty: 'something',
        },
        outcome: taskStates.STARTED,
      },
    ]

    examples.forEach((example) => {
      test(`should show bassRequest ${example.outcome} when ${example.description}`, () => {
        const licence = {
          proposedAddress: {
            addressProposed: {
              decision: 'No',
            },
          },
          bassReferral: {
            bassRequest: {
              ...example.bassRequest,
            },
          },
        }

        const state = getBassRequestState(licence)

        expect(state.bassRequest).toEqual(example.outcome)
      })
    })
  })

  describe('bassWithdrawn decision', () => {
    const examples = [
      {
        description: 'Nothing in the rejections list',
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
        },
        bassRejections: [],
        outcome: false,
      },
      {
        description: 'Previous withdrawal, current bassRequest unstarted',
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
        },
        bassRejections: [{ withdrawal: 'offer' }],
        outcome: true,
      },
      {
        description: 'Previous withdrawal, current bassRequest with no specific area',
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
            specificArea: 'No',
          },
        },
        bassRejections: [{ withdrawal: 'offer' }],
        outcome: false,
      },
      {
        description: 'Previous withdrawal, current bassAreaCheck done',
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
            specificArea: 'No',
          },
          bassAreaCheck: {
            bassAreaCheckSeen: true,
          },
        },
        bassRejections: [{ withdrawal: 'offer' }],
        outcome: false,
      },
    ]

    examples.forEach((example) => {
      test(`should show bassWithdrawn ${example.outcome} when ${example.description}`, () => {
        const licence = {
          proposedAddress: {
            addressProposed: {
              decision: 'No',
            },
          },
          bassReferral: {
            ...example.bassReferral,
          },
          bassRejections: example.bassRejections,
        }

        const state = getBassState(licence)

        expect(state.bassWithdrawn).toEqual(example.outcome)
      })
    })
  })
})
