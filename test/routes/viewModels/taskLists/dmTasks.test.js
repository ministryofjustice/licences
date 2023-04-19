const dmTasks = require('../../../../server/routes/viewModels/taskLists/dmTasks')

describe('dmTasks', () => {
  const tasks = {}

  describe('rejected task list', () => {
    test('withdrawn address shows rejected list', () => {
      const results = dmTasks({ tasks, decisions: { addressWithdrawn: true, bassAccepted: 'No' } })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'eligibilitySummaryTask',
        'Proposed curfew address',
        'Return to prison case admin',
        'Final decision',
      ])
    })

    test('rejected curfew address shows rejected list with risk management', () => {
      const results = dmTasks({ tasks, decisions: { curfewAddressRejected: true } })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'eligibilitySummaryTask',
        'Proposed curfew address',
        'Risk management',
        'Return to prison case admin',
        'Final decision',
      ])
    })
  })

  describe('standard task list', () => {
    test('default list', () => {
      const results = dmTasks({
        tasks,
        decisions: {},
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'Proposed curfew address',
        'Risk management',
        'Victim liaison',
        'Curfew hours',
        'Additional conditions',
        'Reporting instructions',
        'Review case',
        'Return to prison case admin',
        'Final decision',
      ])
    })

    test('Accepted CAS2 (BASS) address', () => {
      const results = dmTasks({
        tasks,
        decisions: { bassReferralNeeded: true, bassAccepted: 'Yes' },
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'CAS2 address',
        'Risk management',
        'Victim liaison',
        'Curfew hours',
        'Additional conditions',
        'Reporting instructions',
        'Review case',
        'Return to prison case admin',
        'Final decision',
      ])
    })

    test('Confiscation order', () => {
      const results = dmTasks({
        tasks,
        decisions: { confiscationOrder: true },
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'Proposed curfew address',
        'Risk management',
        'Victim liaison',
        'Curfew hours',
        'Additional conditions',
        'Reporting instructions',
        'Review case',
        'Return to prison case admin',
        'Final decision',
      ])
    })

    test('previously rejected address with CAS2 (BASS) accepted', () => {
      const results = dmTasks({
        tasks,
        decisions: { curfewAddressRejected: true, bassReferralNeeded: true, bassAccepted: 'Yes' },
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'CAS2 address',
        'Risk management',
        'Victim liaison',
        'Curfew hours',
        'Additional conditions',
        'Reporting instructions',
        'Review case',
        'Return to prison case admin',
        'Final decision',
      ])
    })
  })
})
