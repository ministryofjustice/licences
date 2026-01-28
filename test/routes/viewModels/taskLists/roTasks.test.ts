import { getRoTasks, getRoTasksPostApproval } from '../../../../server/routes/viewModels/taskLists/roTasks'

describe('roTasks', () => {
  const tasks = {}

  describe('standard task list', () => {
    test('default list', () => {
      const results = getRoTasks({
        decisions: {},
        tasks,
        allowedTransition: null,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'Proposed curfew address',
        'Risk management',
        'Victim liaison',
        'Curfew hours',
        'Additional conditions',
        'Reporting instructions',
        'Curfew address check form',
        'Submit to prison case admin',
      ])
    })

    test('licence to be created in cvl removes curfew hours, conditions and reporting instructions tasks', () => {
      const results = getRoTasks({
        decisions: { useCvlForLicenceCreation: true },
        tasks,
        allowedTransition: null,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'Proposed curfew address',
        'Risk management',
        'Victim liaison',
        'Curfew address check form',
        'Submit to prison case admin',
      ])
    })

    test('bass referral needed includes CAS2 area check task', () => {
      const results = getRoTasks({
        decisions: { bassReferralNeeded: true },
        tasks,
        allowedTransition: null,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'CAS2 area check',
        'Risk management',
        'Victim liaison',
        'Curfew hours',
        'Additional conditions',
        'Reporting instructions',
        'Curfew address check form',
        'Submit to prison case admin',
      ])
    })

    test('address proposed includes proposed curfew address task', () => {
      const results = getRoTasks({
        decisions: { bassReferralNeeded: false, curfewAddressRejected: false },
        tasks,
        allowedTransition: null,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'Proposed curfew address',
        'Risk management',
        'Victim liaison',
        'Curfew hours',
        'Additional conditions',
        'Reporting instructions',
        'Curfew address check form',
        'Submit to prison case admin',
      ])
    })

    test('approved premises required removes risk management task', () => {
      const results = getRoTasks({
        decisions: { approvedPremisesRequired: true },
        tasks,
        allowedTransition: null,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'Proposed curfew address',
        'Victim liaison',
        'Curfew hours',
        'Additional conditions',
        'Reporting instructions',
        'Curfew address check form',
        'Submit to prison case admin',
      ])
    })
  })

  describe('rejected task list', () => {
    test('address rejected in risk phase', () => {
      const results = getRoTasks({
        decisions: { curfewAddressRejected: true, addressUnsuitable: true },
        tasks,
        allowedTransition: null,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'Risk management',
        'Curfew address check form',
        'Submit to prison case admin',
      ])
    })

    test('address rejected in review phase', () => {
      const results = getRoTasks({
        decisions: { curfewAddressRejected: true, addressReviewFailed: true },
        tasks,
        allowedTransition: null,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'Proposed curfew address',
        'Curfew address check form',
        'Submit to prison case admin',
      ])
    })
  })

  describe('post approval task list', () => {
    test('default list', () => {
      const results = getRoTasksPostApproval({
        decisions: {},
        tasks,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'Risk management',
        'Curfew hours',
        'Additional conditions',
        'Reporting instructions',
        'Curfew address check form',
      ])
    })

    test('approved premises required includes proposed curfew address and removes risk management tasks', () => {
      const results = getRoTasksPostApproval({
        decisions: { approvedPremisesRequired: true },
        tasks,
      })

      expect(results.map(({ task, title }) => task || title)).toStrictEqual([
        'Proposed curfew address',
        'Curfew hours',
        'Additional conditions',
        'Reporting instructions',
        'Curfew address check form',
      ])
    })
  })
})
