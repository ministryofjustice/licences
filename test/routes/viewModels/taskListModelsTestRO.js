const taskListModel = require('../../../server/routes/viewModels/taskListModels')

describe('TaskList models', () => {
  const proposedCurfewAddressRejected = {
    action: {
      href: '/hdc/curfew/approvedPremises/',
      text: 'Change',
      type: 'link',
    },
    label: 'Address rejected',
    title: 'Proposed curfew address',
    visible: true,
  }
  const proposedCurfewAddress = {
    title: 'Proposed curfew address',
    label: 'Not completed',
    action: { type: 'btn', text: 'Continue', href: '/hdc/curfew/approvedPremises/' },
    visible: true,
  }

  const bassAreaCheck = {
    action: {
      href: '/hdc/bassReferral/bassAreaCheck/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Not completed',
    title: 'BASS area check',
    visible: true,
  }

  const riskManagement = {
    title: 'Risk management',
    label: 'Not completed',
    action: { type: 'btn', text: 'Continue', href: '/hdc/risk/riskManagement/' },
    visible: true,
  }
  const riskManagementAddressUnsuitable = {
    action: {
      href: '/hdc/risk/riskManagement/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Address unsuitable',
    title: 'Risk management',
    visible: true,
  }

  const victimLiasion = {
    action: {
      href: '/hdc/victim/victimLiaison/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Not completed',
    title: 'Victim liaison',
    visible: true,
  }

  const curfewHours = {
    title: 'Curfew hours',
    label: 'Not completed',
    action: { type: 'btn', text: 'Continue', href: '/hdc/curfew/curfewHours/' },
    visible: true,
  }
  const curfewHoursChange = {
    title: 'Curfew hours',
    action: { type: 'link', text: 'Change', href: '/hdc/curfew/curfewHours/' },
    visible: true,
  }

  const additionalConditions = {
    title: 'Additional conditions',
    label: 'Not completed',
    action: { type: 'btn', text: 'Continue', href: '/hdc/licenceConditions/standard/' },
    visible: true,
  }
  const additionalConditionsChange = {
    title: 'Additional conditions',
    action: { type: 'link', text: 'Change', href: '/hdc/licenceConditions/standard/' },
    visible: true,
  }

  const reportingInstructions = {
    title: 'Reporting instructions',
    label: 'Not completed',
    action: { type: 'btn', text: 'Continue', href: '/hdc/reporting/reportingInstructions/' },
    visible: true,
  }
  const reportingInstructionsChange = {
    title: 'Reporting instructions',
    action: { type: 'link', text: 'Change', href: '/hdc/vary/reportingAddress/' },
    visible: true,
  }

  const createLicenceVersion1 = {
    title: 'Create licence',
    label: 'Ready to create version 1',
    action: { type: 'btn', href: '/hdc/pdf/select/', text: 'Continue' },
    visible: true,
  }
  const createLicenceVersion22 = {
    title: 'Create licence',
    label: 'Ready to create version 2.2',
    action: { type: 'btn', href: '/hdc/pdf/select/', text: 'Continue' },
    visible: true,
  }
  const createLicenceVersion12 = {
    title: 'Create licence',
    label: 'Ready to create version 1.2',
    action: { type: 'btn', href: '/hdc/pdf/select/', text: 'Continue' },
    visible: true,
  }

  const viewCurrentLicence = {
    title: 'View current licence',
    label: 'Licence version 2',
    action: { type: 'btn', href: '/hdc/pdf/create/templateName/', text: 'View', newTab: true },
    visible: true,
  }

  const vary = { task: 'varyLicenceTask', visible: true }
  const permissionForVariation = {
    title: 'Permission for variation',
    action: { type: 'link', text: 'Change', href: '/hdc/vary/evidence/' },
    visible: true,
  }
  const curfewAddressVary = {
    title: 'Curfew address',
    action: { type: 'link', text: 'Change', href: '/hdc/vary/address/' },
    visible: true,
  }

  const submitCA = {
    action: {
      href: '/hdc/review/licenceDetails/',
      text: 'Continue',
      type: 'btn',
    },
    title: 'Submit to prison case admin',
    label: 'Ready to submit',
    visible: true,
  }

  describe('roTasksPostApproval', () => {
    it('should return four tasks', () => {
      expect(
        taskListModel(
          'RO',
          false,
          {
            decisions: {},
            tasks: {},
            stage: 'DECIDED',
          },
          { version: 1 },
          null
        )
      ).to.eql([riskManagement, curfewHours, additionalConditions, reportingInstructions])
    })

    it('should hide risk and show address taks when approved premises', () => {
      expect(
        taskListModel(
          'RO',
          false,
          {
            decisions: { approvedPremisesRequired: true },
            tasks: {},
            stage: 'DECIDED',
          },
          { version: 1 },
          null
        )
      ).to.eql([proposedCurfewAddress, curfewHours, additionalConditions, reportingInstructions])
    })
  })

  describe('vary', () => {
    it('should return vary licence task if licence is unstarted', () => {
      expect(
        taskListModel(
          'RO',
          true,
          {
            decisions: {},
            tasks: {},
            stage: 'UNSTARTED',
          },
          { version: 1, versionDetails: {}, approvedVersion: {}, approvedVersionDetails: {} },
          null
        )
      ).to.eql([vary])
    })

    it('should return the rest if licence not unstarted', () => {
      expect(
        taskListModel(
          'RO',
          true,
          {
            decisions: {},
            tasks: {},
            stage: 'SOMETHINGELSE',
          },
          { version: 1, approvedVersion: 1, versionDetails: {}, approvedVersionDetails: {} },
          null
        )
      ).to.eql([
        permissionForVariation,
        curfewAddressVary,
        additionalConditionsChange,
        curfewHoursChange,
        reportingInstructionsChange,
        createLicenceVersion1,
      ])
    })

    it('should show current version if one exists and not show create task if version not different', () => {
      expect(
        taskListModel(
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
          },
          null
        )
      ).to.eql([
        viewCurrentLicence,
        permissionForVariation,
        curfewAddressVary,
        additionalConditionsChange,
        curfewHoursChange,
        reportingInstructionsChange,
      ])
    })

    it('should not show current version if approved version is empty', () => {
      expect(
        taskListModel(
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
          },
          null
        )
      ).to.eql([
        permissionForVariation,
        curfewAddressVary,
        additionalConditionsChange,
        curfewHoursChange,
        reportingInstructionsChange,
        createLicenceVersion22,
      ])
    })

    it('should show create licence if version ahead of approved version', () => {
      expect(
        taskListModel(
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
          },
          null
        )
      ).to.eql([
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
    it('should show all tasks if address not rejected', () => {
      expect(
        taskListModel(
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
          {},
          'roToCa'
        )
      ).to.eql([
        proposedCurfewAddress,
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditions,
        reportingInstructions,
        submitCA,
      ])
    })

    it('should show bass task if bass referral needed', () => {
      expect(
        taskListModel(
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
          {},
          'roToCa'
        )
      ).to.eql([
        {
          action: {
            href: '/hdc/bassReferral/bassAreaCheck/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'BASS area check',
          visible: true,
        },
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditions,
        reportingInstructions,
        submitCA,
      ])
    })

    it('should show only curfew address review task and send if review failed', () => {
      expect(
        taskListModel(
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
          {},
          'roToCa'
        )
      ).to.eql([proposedCurfewAddressRejected, submitCA])
    })

    it('should show only risk task and send if unsuitable failed', () => {
      expect(
        taskListModel(
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
          {},
          'roToCa'
        )
      ).to.eql([riskManagementAddressUnsuitable, submitCA])
    })

    it('should show only bass task and send if bass failed', () => {
      expect(
        taskListModel(
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
          {},
          'roToCa'
        )
      ).to.eql([bassAreaCheck, submitCA])
    })

    it('should show all tasks except risk if approved premises required', () => {
      expect(
        taskListModel(
          'RO',
          false,
          { decisions: { approvedPremisesRequired: true }, tasks: {}, stage: 'PROCESSING_RO' },
          {},
          'roToCa'
        )
      ).to.eql([
        proposedCurfewAddress,
        victimLiasion,
        curfewHours,
        additionalConditions,
        reportingInstructions,
        submitCA,
      ])
    })
  })

  describe('no task list', () => {
    it('should return no licence task', () => {
      expect(
        taskListModel(
          'RO',
          false,
          {
            decisions: {},
            tasks: {},
            stage: 'UNSTARTED',
          },
          {},
          'roToCa'
        )
      ).to.eql([
        {
          title: 'No active licence',
          action: { type: 'link', text: 'Return to case list', href: '/caseList/' },
        },
      ])
    })
  })
})
