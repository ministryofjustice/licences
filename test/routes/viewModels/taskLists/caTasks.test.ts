import { getCaTasksFinalChecks } from '../../../../server/routes/viewModels/taskLists/caTasks'

describe('caTasks', () => {
  const tasks = { bassAreaCheck: 'DONE', optOut: 'DONE' }

  describe('final checks task list', () => {
    test('default list', () => {
      const results = getCaTasksFinalChecks({
        decisions: { eligible: true, curfewAddressApproved: true },
        tasks,
        allowedTransition: null,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'eligibilityTask',
        'Proposed curfew address',
        'Risk management',
        'Victim liaison',
        'Curfew hours',
        'Additional conditions',
        'Reporting instructions',
        'Review case',
        'Postpone or refuse',
        // Refuse task title is null so check label below
        null,
        'Submit to decision maker',
      ])
      expect(results[9].label).toContain('Refuse')
    })

    test('licence to be created in cvl removes curfew hours, conditions and reporting instructions tasks', () => {
      const results = getCaTasksFinalChecks({
        decisions: { eligible: true, curfewAddressApproved: true, useCvlForLicenceCreation: true },
        tasks,
        allowedTransition: null,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'eligibilityTask',
        'Proposed curfew address',
        'Risk management',
        'Victim liaison',
        'Review case',
        'Postpone or refuse',
        // Refuse task title is null so check label below
        null,
        'Submit to decision maker',
      ])
      expect(results[6].label).toContain('Refuse')
    })
  })
})
