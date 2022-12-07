const riskManagement = require('../../../../../server/routes/viewModels/taskLists/tasks/riskManagement')

describe('risk management task', () => {
  test('should return Address unsuitable if addressUnsuitable = true', () => {
    expect(
      riskManagement.view({
        decisions: { addressUnsuitable: true, riskManagementVersion: '1' },
        tasks: {},
      })
    ).toStrictEqual({
      action: { href: '/hdc/review/risk/', text: 'View', type: 'btn-secondary' },
      label: 'Address unsuitable',
      title: 'Risk management',
    })
  })

  test('should return No risks if risk management not needed and risk management version not 2', () => {
    expect(
      riskManagement.view({
        decisions: { addressReviewFailed: false, riskManagementNeeded: false, riskManagementVersion: '1' },
        tasks: { riskManagement: 'DONE' },
      })
    ).toStrictEqual({
      action: { href: '/hdc/review/risk/', text: 'View', type: 'btn-secondary' },
      label: 'No risks',
      title: 'Risk management',
    })
  })

  test('should return Completed if risk management section is done and risk management version is 2', () => {
    expect(
      riskManagement.view({
        decisions: {
          addressReviewFailed: false,
          showMandatoryAddressChecksNotCompletedWarning: false,
          riskManagementVersion: '2',
        },
        tasks: { riskManagement: 'DONE' },
      })
    ).toStrictEqual({
      action: { href: '/hdc/review/risk/', text: 'View', type: 'btn-secondary' },
      label: 'Completed',
      title: 'Risk management',
    })
  })

  test('should return Risk management required if risk management needed', () => {
    expect(
      riskManagement.view({
        decisions: { addressReviewFailed: false, riskManagementNeeded: true, riskManagementVersion: '1' },
        tasks: { riskManagement: 'DONE' },
      })
    ).toStrictEqual({
      action: { href: '/hdc/review/risk/', text: 'View', type: 'btn-secondary' },
      label: 'Risk management required',
      title: 'Risk management',
    })
  })

  test('should return Not completed if risk task not done', () => {
    expect(
      riskManagement.view({
        decisions: { addressReviewFailed: false, riskManagementNeeded: true },
        tasks: { riskManagement: 'UNSTARTED' },
      })
    ).toStrictEqual({
      action: { href: '/hdc/review/risk/', text: 'View', type: 'btn-secondary' },
      label: 'Not completed',
      title: 'Risk management',
    })
  })

  test('should return warning if mandatory address checks not completed and BASS address suitable is false', () => {
    expect(
      riskManagement.view({
        decisions: { showMandatoryAddressChecksNotCompletedWarning: true, riskManagementVersion: '2' },
        tasks: {},
      })
    ).toStrictEqual({
      action: { href: '/hdc/review/risk/', text: 'View', type: 'btn-secondary' },
      label: 'WARNING||Mandatory address checks not completed',
      title: 'Risk management',
    })
  })

  test('should return warning if still waiting for information', () => {
    expect(
      riskManagement.view({
        decisions: { awaitingRiskInformation: true, riskManagementVersion: '1' },
        tasks: {},
      })
    ).toStrictEqual({
      action: { href: '/hdc/review/risk/', text: 'View', type: 'btn-secondary' },
      label: 'WARNING||Still waiting for information',
      title: 'Risk management',
    })
  })

  test('should show continue btn to curfewAddressReview if curfewAddressReview: !DONE || UNSTARTED', () => {
    expect(
      riskManagement.view({
        decisions: {},
        tasks: { riskManagement: 'SOMETHING' },
      })
    ).toStrictEqual({
      action: {
        href: '/hdc/review/risk/',
        text: 'View',
        type: 'btn-secondary',
      },
      label: 'Not completed',
      title: 'Risk management',
    })
  })
})

describe('Action varies based on type', () => {
  test('view', () => {
    expect(
      riskManagement.view({
        decisions: {},
        tasks: { riskManagement: 'SOMETHING' },
      }).action
    ).toStrictEqual({
      href: '/hdc/review/risk/',
      text: 'View',
      type: 'btn-secondary',
    })
  })

  test('edit', () => {
    expect(
      riskManagement.edit({
        decisions: {},
        tasks: { riskManagement: 'SOMETHING' },
      }).action
    ).toStrictEqual({
      dataQa: 'risk-management',
      href: '/hdc/risk/riskManagement/',
      text: 'View/Edit',
      type: 'btn-secondary',
    })
  })

  test('ro', () => {
    expect(
      riskManagement.ro({
        decisions: {},
        tasks: { riskManagement: 'SOMETHING' },
      }).action
    ).toStrictEqual({
      href: '/hdc/risk/riskManagement/',
      text: 'Continue',
      type: 'btn',
    })
  })
})
