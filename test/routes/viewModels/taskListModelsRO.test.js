const { getTaskLists } = require('../../../server/routes/viewModels/taskListModels')

describe('TaskList models', () => {
  const proposedCurfewAddressRejected = {
    action: {
      href: '/hdc/curfew/approvedPremises/',
      text: 'Change',
      type: 'link',
    },
    label: 'Address rejected',
    title: 'Proposed curfew address',
  }
  const proposedCurfewAddress = {
    title: 'Proposed curfew address',
    label: 'Not completed',
    action: { type: 'btn', text: 'Continue', href: '/hdc/curfew/approvedPremises/' },
  }

  const bassAreaCheck = {
    action: {
      href: '/hdc/bassReferral/bassAreaCheck/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Not completed',
    title: 'CAS2 area check',
  }

  const bassAreaCheckWithApprovedAddress = {
    action: {
      href: '/hdc/bassReferral/bassAreaCheck/',
      text: 'Change',
      type: 'link',
    },
    label: 'Approved premises required',
    title: 'CAS2 area check',
  }

  const riskManagement = {
    title: 'Risk management',
    label: 'Not completed',
    action: { type: 'btn', text: 'Continue', href: '/hdc/risk/riskManagement/' },
  }
  const riskManagementAddressUnsuitable = {
    action: {
      href: '/hdc/risk/riskManagement/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Address unsuitable',
    title: 'Risk management',
  }

  const victimLiasion = {
    action: {
      href: '/hdc/victim/victimLiaison/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Not completed',
    title: 'Victim liaison',
  }

  const curfewHours = {
    title: 'Curfew hours',
    label: 'Not completed',
    action: { type: 'btn', text: 'Continue', href: '/hdc/curfew/curfewHours/' },
  }
  const curfewHoursChange = {
    title: 'Curfew hours',
    action: { type: 'link', text: 'Change', href: '/hdc/curfew/curfewHours/' },
  }

  const additionalConditions = {
    title: 'Additional conditions',
    label: 'Not completed',
    action: { type: 'btn', text: 'Continue', href: '/hdc/licenceConditions/standard/' },
  }
  const additionalConditionsChange = {
    title: 'Additional conditions',
    action: { type: 'link', text: 'Change', href: '/hdc/licenceConditions/standard/' },
  }

  const reportingInstructions = {
    title: 'Reporting instructions',
    label: 'Not completed',
    action: { type: 'btn', text: 'Continue', href: '/hdc/reporting/reportingInstructions/' },
  }
  const reportingInstructionsChange = {
    title: 'Reporting instructions',
    action: { type: 'link', text: 'Change', href: '/hdc/vary/reportingAddress/' },
  }

  const curfewAddressCheck = {
    title: 'Curfew address check form',
    action: { type: 'btn', href: '/hdc/forms/curfewAddress/', text: 'Create PDF', newTab: true },
  }

  const createLicenceVersion1 = {
    title: 'Create licence',
    label: 'Ready to create version 1',
    action: { type: 'btn', href: '/hdc/pdf/selectLicenceType/', text: 'Continue' },
  }
  const createLicenceVersion22 = {
    title: 'Create licence',
    label: 'Ready to create version 2.2',
    action: { type: 'btn', href: '/hdc/pdf/selectLicenceType/', text: 'Continue' },
  }
  const createLicenceVersion12 = {
    title: 'Create licence',
    label: 'Ready to create version 1.2',
    action: { type: 'btn', href: '/hdc/pdf/selectLicenceType/', text: 'Continue' },
  }

  const viewCurrentLicence = {
    title: 'View current licence',
    label: 'Licence version 2',
    action: { type: 'btn', href: '/hdc/pdf/create/', text: 'View', newTab: true },
  }

  const vary = { task: 'varyLicenceTask' }
  const permissionForVariation = {
    title: 'Permission for variation and justification of conditions',
    action: { type: 'link', text: 'Change', href: '/hdc/vary/evidence/' },
  }
  const curfewAddressVary = {
    title: 'Curfew address',
    action: { type: 'link', text: 'Change', href: '/hdc/vary/address/' },
  }

  const submitCA = {
    action: {
      href: '/hdc/review/licenceDetails/',
      text: 'Continue',
      type: 'btn',
      dataQa: 'continue',
    },
    title: 'Submit to prison case admin',
    label: 'Tasks not yet complete',
  }

  const submitCAComplete = {
    action: {
      href: '/hdc/review/licenceDetails/',
      text: 'Continue',
      type: 'btn',
      dataQa: 'continue',
    },
    title: 'Submit to prison case admin',
    label: 'Ready to submit',
  }

  describe('roTasksPostApproval', () => {
    test('should return standard tasks', () => {
      expect(
        getTaskLists(
          'RO',
          false,
          {
            decisions: {},
            tasks: {},
            stage: 'DECIDED',
          },
          { version: 1 }
        )
      ).toEqual([riskManagement, curfewHours, additionalConditions, reportingInstructions, curfewAddressCheck])
    })

    test('should hide risk and show address taks when approved premises', () => {
      expect(
        getTaskLists(
          'RO',
          false,
          {
            decisions: { approvedPremisesRequired: true },
            tasks: {},
            stage: 'DECIDED',
          },
          { version: 1 }
        )
      ).toEqual([proposedCurfewAddress, curfewHours, additionalConditions, reportingInstructions, curfewAddressCheck])
    })
  })

  describe('vary', () => {
    test('should return vary licence task if licence is unstarted', () => {
      expect(
        getTaskLists(
          'RO',
          true,
          {
            decisions: {},
            tasks: {},
            stage: 'UNSTARTED',
          },
          { version: 1, versionDetails: {}, approvedVersion: {}, approvedVersionDetails: {} }
        )
      ).toEqual([vary])
    })

    test('should return the rest if licence not unstarted', () => {
      expect(
        getTaskLists(
          'RO',
          true,
          {
            decisions: {},
            tasks: {},
            stage: 'SOMETHINGELSE',
          },
          { version: 1, approvedVersion: 1, versionDetails: {}, approvedVersionDetails: {} }
        )
      ).toEqual([
        permissionForVariation,
        curfewAddressVary,
        additionalConditionsChange,
        curfewHoursChange,
        reportingInstructionsChange,
        createLicenceVersion1,
      ])
    })

    test('should show current version if one exists and not show create task if version not different', () => {
      expect(
        getTaskLists(
          'RO',
          true,
          {
            decisions: {},
            tasks: {},
            stage: 'SOMETHINGELSE',
          },
          {
            version: 2,
            approvedVersion: 2,
            versionDetails: { version: 1, vary_version: 0 },
            approvedVersionDetails: { version: 1, vary_version: 0, template: 'templateName' },
          }
        )
      ).toEqual([
        viewCurrentLicence,
        permissionForVariation,
        curfewAddressVary,
        additionalConditionsChange,
        curfewHoursChange,
        reportingInstructionsChange,
      ])
    })

    test('should not show current version if approved version is empty', () => {
      expect(
        getTaskLists(
          'RO',
          true,
          {
            decisions: {},
            tasks: {},
            stage: 'SOMETHINGELSE',
          },
          {
            version: 2.2,
            approvedVersion: null,
            versionDetails: { version: 1, vary_version: 0 },
            approvedVersionDetails: {},
          }
        )
      ).toEqual([
        permissionForVariation,
        curfewAddressVary,
        additionalConditionsChange,
        curfewHoursChange,
        reportingInstructionsChange,
        createLicenceVersion22,
      ])
    })

    test('should show create licence if version ahead of approved version', () => {
      expect(
        getTaskLists(
          'RO',
          true,
          {
            decisions: {},
            tasks: {},
            stage: 'SOMETHINGELSE',
          },
          {
            version: 1.2,
            approvedVersion: 1.1,
            versionDetails: { version: 1, vary_version: 2 },
            approvedVersionDetails: { version: 1, vary_version: 1 },
          }
        )
      ).toEqual([
        permissionForVariation,
        curfewAddressVary,
        additionalConditionsChange,
        curfewHoursChange,
        reportingInstructionsChange,
        createLicenceVersion12,
      ])
    })
  })

  describe('roTasks', () => {
    test('should show all tasks if address not rejected', () => {
      expect(
        getTaskLists(
          'RO',
          false,
          {
            decisions: {
              addressReviewFailed: false,
              addressUnsuitable: false,
            },
            tasks: {},
            stage: 'PROCESSING_RO',
          },
          {}
        )
      ).toEqual([
        proposedCurfewAddress,
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditions,
        reportingInstructions,
        curfewAddressCheck,
        submitCA,
      ])
    })

    test('should show bass task if bass referral needed', () => {
      expect(
        getTaskLists(
          'RO',
          false,
          {
            decisions: {
              addressReviewFailed: false,
              addressUnsuitable: false,
              bassReferralNeeded: true,
            },
            tasks: {},
            stage: 'PROCESSING_CA',
          },
          {}
        )
      ).toEqual([
        {
          action: {
            href: '/hdc/bassReferral/bassAreaCheck/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'CAS2 area check',
        },
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditions,
        reportingInstructions,
        curfewAddressCheck,
        submitCA,
      ])
    })

    test('should show only curfew address review task, pdf print task, and send if review failed', () => {
      expect(
        getTaskLists(
          'RO',
          false,
          {
            decisions: {
              addressReviewFailed: true,
              curfewAddressRejected: true,
              addressUnsuitable: false,
              bassReferralNeeded: false,
            },
            tasks: {},
            stage: 'APPROVAL',
          },
          {}
        )
      ).toEqual([proposedCurfewAddressRejected, curfewAddressCheck, submitCA])
    })

    test('should show only risk task, pdf print task, and send if unsuitable failed', () => {
      expect(
        getTaskLists(
          'RO',
          false,
          {
            decisions: {
              curfewAddressRejected: true,
              bassReferralNeeded: false,
              addressReviewFailed: false,
              addressUnsuitable: true,
            },
            tasks: {},
            stage: 'ELIGIBILITY',
          },
          {}
        )
      ).toEqual([riskManagementAddressUnsuitable, curfewAddressCheck, submitCA])
    })

    test('should show only bass task, pdf print task, and send if bass failed', () => {
      expect(
        getTaskLists(
          'RO',
          false,
          {
            decisions: {
              bassAreaNotSuitable: true,
              bassReferralNeeded: true,
            },
            tasks: {},
            stage: 'APPROVAL',
          },
          {}
        )
      ).toEqual([bassAreaCheck, curfewAddressCheck, submitCA])
    })

    test('should show all tasks except risk if approved premises required', () => {
      expect(
        getTaskLists(
          'RO',
          false,
          {
            decisions: { approvedPremisesRequired: true },
            tasks: {},
            stage: 'PROCESSING_RO',
          },
          {}
        )
      ).toEqual([
        proposedCurfewAddress,
        victimLiasion,
        curfewHours,
        additionalConditions,
        reportingInstructions,
        curfewAddressCheck,
        submitCA,
      ])
    })

    test('should show the Bass area check task with a label of Approved premises address if approved premises has been input', () => {
      expect(
        getTaskLists(
          'RO',
          false,
          {
            decisions: {
              approvedPremisesRequired: true,
              bassReferralNeeded: true,
              curfewAddressRejected: false,
            },
            tasks: {
              curfewAddress: 'DONE',
              approvedPremisesAddress: 'DONE',
              bassAreaCheck: 'DONE',
            },
            stage: 'PROCESSING_RO',
          },
          {}
        )
      ).toEqual([
        bassAreaCheckWithApprovedAddress,
        victimLiasion,
        curfewHours,
        additionalConditions,
        reportingInstructions,
        curfewAddressCheck,
        submitCAComplete,
      ])
    })
  })

  describe('no task list', () => {
    test('should return no licence task', () => {
      expect(
        getTaskLists(
          'RO',
          false,
          {
            decisions: {},
            tasks: {},
            stage: 'UNSTARTED',
          },
          {}
        )
      ).toEqual([
        {
          title: 'No active licence',
          action: { type: 'link', text: 'Return to case list', href: '/caseList/' },
        },
      ])
    })
  })
})
