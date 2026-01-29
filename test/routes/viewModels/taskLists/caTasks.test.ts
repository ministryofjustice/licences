import { getCaTasksFinalChecks, getCaTasksPostApproval } from '../../../../server/routes/viewModels/taskLists/caTasks'

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

  describe('post approval task list', () => {
    const stage = 'DECIDED'
    test('default list', () => {
      const results = getCaTasksPostApproval(stage)({
        decisions: { eligible: true, curfewAddressApproved: true, dmRefused: false },
        tasks,
        allowedTransition: null,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'eligibilitySummaryTask',
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
        'Resubmit to DM',
        'Create licence',
      ])
      expect(results[9].label).toContain('Refuse')
      // Create licence label only contains wording if licence to be created in cvl
      expect(results[11].label).toBeNull()
    })

    test('licence to be created in cvl removes curfew hours, conditions and reporting instructions tasks', () => {
      const results = getCaTasksPostApproval(stage)({
        decisions: { eligible: true, curfewAddressApproved: true, dmRefused: false, useCvlForLicenceCreation: true },
        tasks,
        allowedTransition: null,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'eligibilitySummaryTask',
        'Proposed curfew address',
        'Risk management',
        'Victim liaison',
        'Review case',
        'Postpone or refuse',
        // Refuse task title is null so check label below
        null,
        'Resubmit to DM',
        'Create licence',
      ])
      expect(results[6].label).toContain('Refuse')
      expect(results[8].label).toContain('Check the Create and vary a licence service')
    })
  })
})
