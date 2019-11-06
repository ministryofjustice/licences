const taskListModel = require('../../../server/routes/viewModels/taskListModels')

describe('TaskList models', () => {
  const eligibilitySummary = { task: 'eligibilitySummaryTask' }

  const returnPCA = {
    title: 'Return to prison case admin',
    action: { type: 'btn-secondary', href: '/hdc/send/return/', text: 'Return to prison case admin' },
  }

  const riskManagement = {
    title: 'Risk management',
    label: 'Not completed',
    action: { href: '/hdc/review/risk/', text: 'View', type: 'btn-secondary' },
  }

  const victimLiasion = {
    title: 'Victim liaison',
    label: 'Not completed',
    action: { href: '/hdc/review/victimLiaison/', text: 'View', type: 'btn-secondary' },
  }

  const curfewHours = {
    title: 'Curfew hours',
    label: 'Not completed',
    action: { href: '/hdc/review/curfewHours/', text: 'View', type: 'btn-secondary' },
  }

  const additionalConditions = {
    title: 'Additional conditions',
    label: 'Not completed',
    action: { href: '/hdc/review/conditions/', text: 'View', type: 'btn-secondary' },
  }

  const reportingInstructions = {
    title: 'Reporting instructions',
    label: 'Not completed',
    action: { href: '/hdc/review/reporting/', text: 'View', type: 'btn-secondary' },
  }

  const reviewCase = {
    title: 'Review case',
    label: 'Not completed',
    action: { type: 'btn-secondary', href: '/hdc/review/finalChecks/', text: 'View' },
  }
  const reviewCaseConfiscationOrder = {
    title: 'Review case',
    label: 'WARNING||The offender is subject to a confiscation order',
    action: { type: 'btn-secondary', href: '/hdc/review/finalChecks/', text: 'View' },
  }

  const proposedCurfewAddress = {
    title: 'Proposed curfew address',
    label: 'Not completed',
    action: { type: 'btn-secondary', href: '/hdc/review/address/', text: 'View' },
  }
  const proposedCurfewAddressWithdrawn = {
    title: 'Proposed curfew address',
    label: 'Address withdrawn',
    action: { type: 'btn-secondary', href: '/hdc/review/address/', text: 'View' },
  }
  const proposedCurfewAddressAP = {
    action: {
      href: '/hdc/review/approvedPremisesAddress/',
      text: 'View',
      type: 'btn-secondary',
    },
    label: 'Not completed',
    title: 'Proposed curfew address',
  }

  const bassAddress = {
    title: 'BASS address',
    label: 'BASS referral requested',
    action: { href: '/hdc/review/bassOffer/', text: 'View', type: 'btn-secondary' },
  }

  const finalDecision = {
    title: 'Final decision',
    label: 'Not started',
    action: { href: '/hdc/approval/release/', text: 'Continue', type: 'btn' },
  }
  const finalDecisionAwaitingRefusal = {
    title: 'Final decision',
    label: 'Awaiting refusal',
    action: { href: '/hdc/approval/refuseReason/', text: 'Refuse HDC', type: 'btn' },
  }
  const finalDecisionRefuse = {
    title: 'Final decision',
    label: 'Not started',
    action: { href: '/hdc/approval/refuseReason/', text: 'Refuse HDC', type: 'btn' },
  }

  const postpone = {
    title: 'Postpone',
    label: 'Use this to indicate that the process is postponed if a confiscation order is in place',
    action: { href: '/hdc/finalChecks/postpone/', text: 'Postpone', type: 'btn' },
  }

  describe('dmTasks', () => {
    it('should return eligibility and refusal if there is insufficient time', () => {
      expect(
        taskListModel(
          'DM',
          false,
          {
            decisions: { insufficientTimeStop: true },
            tasks: {},
            stage: 'APPROVAL',
          },
          {},
          null
        )
      ).to.eql([eligibilitySummary, finalDecisionAwaitingRefusal])
    })

    it('should display refusal tasks if address withdrawn but not bassReferralNeeded', () => {
      expect(
        taskListModel(
          'DM',
          false,
          {
            decisions: {
              insufficientTimeStop: false,
              bassReferralNeeded: false,
              addressWithdrawn: true,
              curfewAddressRejected: false,
            },
            tasks: {},
            stage: 'APPROVAL',
          },
          {},
          null
        )
      ).to.eql([eligibilitySummary, proposedCurfewAddressWithdrawn, returnPCA, finalDecisionRefuse])
    })

    it('should display refusal tasks if address rejected by Risk Management test but not bassReferralNeeded', () => {
      expect(
        taskListModel(
          'DM',
          false,
          {
            decisions: {
              insufficientTimeStop: false,
              bassReferralNeeded: false,
              addressWithdrawn: false,
              addressUnsuitable: true,
              curfewAddressRejected: true,
              addressReviewFailed: false,
            },
            tasks: {},
            stage: 'APPROVAL',
          },
          {},
          null
        )
      ).to.eql([
        eligibilitySummary,
        proposedCurfewAddress,
        { ...riskManagement, label: 'Address unsuitable' },
        returnPCA,
        finalDecisionRefuse,
      ])
    })

    it('should display refusal tasks if address rejected but not bassReferralNeeded', () => {
      expect(
        taskListModel(
          'DM',
          false,
          {
            decisions: {
              insufficientTimeStop: false,
              bassReferralNeeded: false,
              addressWithdrawn: false,
              addressUnsuitable: false,
              curfewAddressRejected: true,
              addressReviewFailed: true,
            },
            tasks: {},
            stage: 'APPROVAL',
          },
          {},
          null
        )
      ).to.eql([
        eligibilitySummary,
        { ...proposedCurfewAddress, label: 'Address rejected' },
        returnPCA,
        finalDecisionRefuse,
      ])
    })

    it('should display standard tasks if address approved', () => {
      expect(
        taskListModel(
          'DM',
          false,
          {
            decisions: {
              insufficientTimeStop: false,
              bassReferralNeeded: false,
              addressWithdrawn: false,
              curfewAddressRejected: false,
              curfewAddressApproved: true,
            },
            tasks: {},
            stage: 'APPROVAL',
          },
          {},
          null
        )
      ).to.eql([
        proposedCurfewAddress,
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditions,
        reportingInstructions,
        reviewCase,
        returnPCA,
        finalDecision,
      ])
    })

    it('should display standard tasks if bassReferralNeeded', () => {
      expect(
        taskListModel(
          'DM',
          false,
          {
            decisions: {
              insufficientTimeStop: false,
              bassReferralNeeded: true,
              addressWithdrawn: false,
              curfewAddressRejected: false,
              curfewAddressApproved: false,
            },
            tasks: {},
            stage: 'APPROVAL',
          },
          {},
          null
        )
      ).to.eql([
        bassAddress,
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditions,
        reportingInstructions,
        reviewCase,
        returnPCA,
        finalDecision,
      ])
    })

    it('should display standard tasks if approvedPremisesRequired', () => {
      expect(
        taskListModel(
          'DM',
          false,
          {
            decisions: {
              insufficientTimeStop: false,
              approvedPremisesRequired: true,
              addressWithdrawn: false,
              curfewAddressRejected: false,
              curfewAddressApproved: false,
            },
            tasks: {},
            stage: 'APPROVAL',
          },
          {},
          null
        )
      ).to.eql([
        proposedCurfewAddressAP,
        victimLiasion,
        curfewHours,
        additionalConditions,
        reportingInstructions,
        reviewCase,
        returnPCA,
        finalDecision,
      ])
    })

    it('should display postponement if confiscationOrder is true', () => {
      expect(
        taskListModel(
          'DM',
          false,
          {
            decisions: {
              insufficientTimeStop: false,
              bassReferralNeeded: true,
              addressWithdrawn: false,
              curfewAddressRejected: false,
              curfewAddressApproved: false,
              confiscationOrder: true,
            },
            tasks: {},
            stage: 'APPROVAL',
          },
          {},
          null
        )
      ).to.eql([
        bassAddress,
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditions,
        reportingInstructions,
        reviewCaseConfiscationOrder,
        postpone,
        returnPCA,
        finalDecision,
      ])
    })
  })
})
