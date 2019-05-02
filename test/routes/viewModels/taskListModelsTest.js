const taskListModel = require('../../../server/routes/viewModels/taskListModels')

describe('TaskList models', () => {
  describe('caEligibility', () => {
    it('should initially show just eligibility task', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: false,
              optedOut: false,
              eligible: false,
            },
            tasks: {
              eligibility: 'UNSTARTED',
              optOut: 'UNSTARTED',
            },
            stage: 'ELIGIBILITY',
          },
          {},
          {},
          null
        )
      ).to.eql([{ task: 'eligibilityTask', visible: true }])
    })

    it('should show info and address task after eligibility successfully completed', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: false,
              optedOut: false,
              eligible: true,
            },
            tasks: {
              eligibility: 'DONE',
              optOut: 'UNSTARTED',
            },
            stage: 'ELIGIBILITY',
          },
          {},
          null
        )
      ).to.eql([
        { task: 'eligibilityTask', visible: true },
        {
          action: {
            href: '/caseList/active',
            text: 'Back to case list',
            type: 'btn-secondary',
          },
          label: 'You should now tell the offender using the relevant HDC form from NOMIS',
          title: 'Inform the offender',
          visible: true,
        },
        {
          action: {
            href: '/hdc/proposedAddress/curfewAddressChoice/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Curfew address',
          visible: true,
        },
      ])
    })

    it('should allow submission to RO when optout completed and not opted out', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: false,
              optedOut: false,
              eligible: true,
            },
            tasks: {
              eligibility: 'DONE',
              optOut: 'DONE',
            },
            stage: 'ELIGIBILITY',
          },
          {},
          null
        )
      ).to.eql([
        { task: 'eligibilityTask', visible: true },
        {
          action: {
            href: '/hdc/proposedAddress/curfewAddressChoice/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Curfew address',
          visible: true,
        },
        {
          action: null,
          label: 'Not completed',
          title: 'Submit curfew address',
          visible: true,
        },
      ])
    })

    it('should allow submission for bass review if bass review selected', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: true,
              optedOut: false,
              eligible: true,
            },
            tasks: {
              eligibility: 'DONE',
              optOut: 'DONE',
            },
            stage: 'ELIGIBILITY',
          },
          {},
          null
        )
      ).to.eql([
        { task: 'eligibilityTask', visible: true },
        {
          action: {
            href: '/hdc/proposedAddress/curfewAddressChoice/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Curfew address',
          visible: true,
        },
        {
          action: null,
          label: 'Not completed',
          title: 'Send for BASS area checks',
          visible: true,
        },
      ])
    })

    it('should not allow submission for if opted out', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: true,
              optedOut: true,
              eligible: true,
            },
            tasks: {
              eligibility: 'DONE',
              optOut: 'DONE',
            },
            stage: 'ELIGIBILITY',
          },
          {},
          null
        )
      ).to.eql([
        { task: 'eligibilityTask', visible: true },
        {
          action: {
            href: '/hdc/proposedAddress/curfewAddressChoice/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Offender has opted out of HDC',
          title: 'Curfew address',
          visible: true,
        },
      ])
    })

    it('should allow submission for refusal if ineligible', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: true,
              optedOut: true,
              eligible: false,
            },
            tasks: {
              eligibility: 'DONE',
              optOut: 'DONE',
            },
            stage: 'ELIGIBILITY',
          },
          {},
          'caToDmRefusal'
        )
      ).to.eql([
        { task: 'eligibilityTask', visible: true },
        {
          action: null,
          label: 'Submission unavailable - Offender has opted out of HDC',
          title: 'Submit to decision maker',
          visible: true,
        },
      ])
    })

    it('should allow submission for refusal if address rejected', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: true,
              optedOut: false,
              eligible: true,
              curfewAddressRejected: true,
            },
            tasks: {
              eligibility: 'DONE',
              optOut: 'DONE',
            },
            stage: 'ELIGIBILITY',
          },
          {},
          'caToDmRefusal'
        )
      ).to.eql([
        { task: 'eligibilityTask', visible: true },
        {
          action: {
            href: '/hdc/proposedAddress/rejected/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Curfew address',
          visible: true,
        },
        {
          action: {
            href: '/hdc/send/refusal/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Ready to submit for refusal',
          title: 'Submit to decision maker',
          visible: true,
        },
      ])
    })
  })

  describe('caTasksFinalChecks', () => {
    it('should return list of tasks for standard route', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: false,
              curfewAddressApproved: true,
              bassWithdrawn: false,
              bassAccepted: null,
              optedOut: false,
            },
            tasks: {
              bassAreaCheck: 'UNSTARTED',
            },
            stage: 'PROCESSING_CA',
          },
          {},
          null
        )
      ).to.eql([
        {
          action: {
            href: '/hdc/review/address/',
            text: 'Change',
            type: 'link',
          },
          label: 'Not completed',
          title: 'Proposed curfew address',
          visible: true,
        },
        {
          action: {
            href: '/hdc/risk/riskManagement/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Risk management',
          visible: true,
        },
        {
          action: {
            href: '/hdc/victim/victimLiaison/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Victim liaison',
          visible: true,
        },
        {
          action: {
            href: '/hdc/curfew/curfewHours/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Curfew hours',
          visible: true,
        },
        {
          action: {
            href: '/hdc/review/conditions/',
            text: 'View',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Additional conditions',
          visible: true,
        },
        {
          action: {
            href: '/hdc/review/reporting/',
            text: 'View',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Reporting instructions',
          visible: true,
        },
        { task: 'finalChecksTask', visible: true },
        {
          label: "Postpone the case if you're waiting for information on risk management",
          title: 'Postpone or refuse',
          action: { type: 'btn', text: 'Postpone', href: '/hdc/finalChecks/postpone/' },
          visible: true,
        },
        {
          label: 'Refuse the case if there is no available address or not enough time',
          title: null,
          action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
          visible: true,
        },
        {
          action: null,
          label: 'Not completed',
          title: 'Submit to decision maker',
          visible: true,
        },
      ])
    })

    it('should return a limited set of tasks of curfew address not approved', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              curfewAddressApproved: false,
              bassReferralNeeded: false,
              bassWithdrawn: false,
              bassAccepted: null,
              optedOut: false,
              addressUnsuitable: false,
            },
            tasks: {
              bassAreaCheck: 'UNSTARTED',
            },
            stage: 'PROCESSING_CA',
          },
          {},
          'caToDmRefusal'
        )
      ).to.eql([
        {
          action: {
            href: '/hdc/review/address/',
            text: 'Change',
            type: 'link',
          },
          label: 'Not completed',
          title: 'Proposed curfew address',
          visible: true,
        },
        {
          label: 'Refuse the case if there is no available address or not enough time',
          title: null,
          action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
          visible: true,
        },
        {
          action: {
            href: '/hdc/send/refusal/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Ready to submit for refusal',
          title: 'Submit to decision maker',
          visible: true,
        },
      ])
    })

    it('should show risk if adderss unsuitable', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              curfewAddressApproved: false,
              bassReferralNeeded: false,
              bassWithdrawn: false,
              bassAccepted: null,
              optedOut: false,
              addressUnsuitable: true,
            },
            tasks: {},
            stage: 'PROCESSING_CA',
          },
          {},
          'caToDmRefusal'
        )
      ).to.eql([
        {
          action: {
            href: '/hdc/review/address/',
            text: 'Change',
            type: 'link',
          },
          label: 'Not completed',
          title: 'Proposed curfew address',
          visible: true,
        },
        {
          action: {
            href: '/hdc/risk/riskManagement/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Address unsuitable',
          title: 'Risk management',
          visible: true,
        },
        {
          label: 'Refuse the case if there is no available address or not enough time',
          title: null,
          action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
          visible: true,
        },
        {
          action: {
            href: '/hdc/send/refusal/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Ready to submit for refusal',
          title: 'Submit to decision maker',
          visible: true,
        },
      ])
    })

    it('should return bass specific list of tasks', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              curfewAddressApproved: false,
              bassReferralNeeded: true,
              bassWithdrawn: false,
              bassAccepted: null,
              optedOut: false,
            },
            tasks: {
              bassAreaCheck: 'DONE',
            },
            stage: 'PROCESSING_CA',
          },
          'caToDm'
        )
      ).to.eql([
        {
          title: 'BASS address',
          label: 'BASS referral requested',
          action: {
            href: '/hdc/bassReferral/bassOffer/',
            text: 'Continue',
            type: 'btn',
          },
          visible: true,
        },
        {
          action: {
            href: '/hdc/risk/riskManagement/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Risk management',
          visible: true,
        },
        {
          action: {
            href: '/hdc/victim/victimLiaison/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Victim liaison',
          visible: true,
        },
        {
          action: {
            href: '/hdc/curfew/curfewHours/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Curfew hours',
          visible: true,
        },
        {
          action: {
            href: '/hdc/review/conditions/',
            text: 'View',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Additional conditions',
          visible: true,
        },
        {
          action: {
            href: '/hdc/review/reporting/',
            text: 'View',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Reporting instructions',
          visible: true,
        },
        { task: 'finalChecksTask', visible: true },
        {
          title: 'Postpone or refuse',
          label: "Postpone the case if you're waiting for information on risk management",
          action: {
            href: '/hdc/finalChecks/postpone/',
            text: 'Postpone',
            type: 'btn',
          },
          visible: true,
        },
        {
          label: 'Refuse the case if there is no available address or not enough time',
          title: null,
          action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
          visible: true,
        },
        {
          action: null,
          label: 'Not completed',
          title: 'Submit to decision maker',
          visible: true,
        },
      ])
    })

    it('should not show submit tasks if opted out', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              curfewAddressApproved: false,
              bassReferralNeeded: true,
              bassWithdrawn: false,
              bassAccepted: null,
              optedOut: true,
            },
            tasks: {
              bassAreaCheck: 'DONE',
            },
            stage: 'PROCESSING_CA',
          },
          {},
          'caToDm'
        )
      ).to.eql([
        {
          title: 'BASS address',
          label: 'BASS referral requested',
          action: {
            href: '/hdc/bassReferral/bassOffer/',
            text: 'Continue',
            type: 'btn',
          },
          visible: true,
        },
        {
          action: {
            href: '/hdc/risk/riskManagement/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Risk management',
          visible: true,
        },
        {
          action: {
            href: '/hdc/victim/victimLiaison/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Victim liaison',
          visible: true,
        },
        {
          action: {
            href: '/hdc/curfew/curfewHours/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Curfew hours',
          visible: true,
        },
        {
          action: {
            href: '/hdc/review/conditions/',
            text: 'View',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Additional conditions',
          visible: true,
        },
        {
          action: {
            href: '/hdc/review/reporting/',
            text: 'View',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Reporting instructions',
          visible: true,
        },
        { task: 'finalChecksTask', visible: true },
        {
          title: 'Postpone or refuse',
          label: "Postpone the case if you're waiting for information on risk management",
          action: {
            href: '/hdc/finalChecks/postpone/',
            text: 'Postpone',
            type: 'btn',
          },
          visible: true,
        },
        {
          label: 'Refuse the case if there is no available address or not enough time',
          title: null,
          action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
          visible: true,
        },
      ])
    })

    it('should return limited bass specific list of tasks when bass area check not done', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              curfewAddressApproved: false,
              bassReferralNeeded: true,
              bassWithdrawn: false,
              bassAccepted: null,
              optedOut: false,
            },
            tasks: {
              bassAreaCheck: 'UNFINISHED',
            },
            stage: 'PROCESSING_CA',
          },
          {},
          'caToDmRefusal'
        )
      ).to.eql([
        {
          title: 'BASS address',
          label: 'BASS referral requested',
          action: {
            href: '/hdc/proposedAddress/curfewAddressChoice/',
            text: 'Continue',
            type: 'btn',
          },
          visible: true,
        },
        {
          label: 'Refuse the case if there is no available address or not enough time',
          title: null,
          action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
          visible: true,
        },
        {
          action: {
            href: '/hdc/send/refusal/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Ready to submit for refusal',
          title: 'Submit to decision maker',
          visible: true,
        },
      ])
    })

    it('should return limited bass specific list of tasks when bass excluded', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              curfewAddressApproved: false,
              bassReferralNeeded: true,
              bassWithdrawn: false,
              bassAccepted: 'Unsuitable',
              optedOut: false,
            },
            tasks: {
              bassAreaCheck: 'DONE',
            },
            stage: 'PROCESSING_CA',
          },
          {},
          'caToDmRefusal'
        )
      ).to.eql([
        {
          title: 'BASS address',
          label: 'BASS referral requested',
          action: {
            href: '/hdc/bassReferral/bassOffer/',
            text: 'Continue',
            type: 'btn',
          },
          visible: true,
        },
        {
          label: 'Refuse the case if there is no available address or not enough time',
          title: null,
          action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
          visible: true,
        },
        {
          action: {
            href: '/hdc/send/refusal/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Ready to submit for refusal',
          title: 'Submit to decision maker',
          visible: true,
        },
      ])
    })

    it('should show proposed address task if caToRo transition (new address added)', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: false,
            },
            tasks: {},
            stage: 'PROCESSING_CA',
          },
          {},
          'caToRo'
        )
      ).to.eql([
        {
          action: {
            href: '/hdc/proposedAddress/curfewAddressChoice/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Curfew address',
          visible: true,
        },
        {
          label: 'Refuse the case if there is no available address or not enough time',
          title: null,
          action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
          visible: true,
        },
        {
          action: null,
          label: 'Not completed',
          title: 'Submit curfew address',
          visible: true,
        },
      ])
    })
  })

  describe('caTasksPostApproval', () => {
    it('should return list of tasks for standard route', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              eligible: true,
              curfewAddressApproved: true,
              bassReferralNeeded: false,
              bassWithdrawn: false,
              bassExcluded: false,
              bassAccepted: null,
              optedOut: false,
              dmRefused: false,
              excluded: false,
            },
            tasks: {
              bassAreaCheck: 'UNSTARTED',
              bassOffer: 'UNSTARTED',
            },
            stage: 'DECIDED',
          },
          {},
          null
        )
      ).to.eql([
        { task: 'eligibilitySummaryTask', visible: true },
        {
          action: {
            href: '/hdc/review/address/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Proposed curfew address',
          visible: true,
        },
        {
          action: {
            href: '/hdc/risk/riskManagement/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Risk management',
          visible: true,
        },
        {
          action: {
            href: '/hdc/victim/victimLiaison/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Victim liaison',
          visible: true,
        },
        {
          action: {
            href: '/hdc/curfew/curfewHours/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Curfew hours',
          visible: true,
        },
        {
          action: {
            href: '/hdc/licenceConditions/standard/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Additional conditions',
          visible: true,
        },
        {
          action: {
            href: '/hdc/reporting/reportingInstructions/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Reporting instructions',
          visible: true,
        },
        { task: 'finalChecksTask', visible: true },
        {
          title: 'Postpone or refuse',
          label: "Postpone the case if you're waiting for information on risk management",
          action: {
            href: '/hdc/finalChecks/postpone/',
            text: 'Postpone',
            type: 'btn',
          },
          visible: true,
        },
        {
          label: 'Refuse the case if there is no available address or not enough time',
          title: null,
          action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
          visible: true,
        },
        {
          action: null,
          title: 'Create licence',
          visible: true,
        },
      ])
    })

    it('should return bass tasks if required', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              eligible: true,
              curfewAddressApproved: true,
              bassReferralNeeded: true,
              bassWithdrawn: false,
              bassExcluded: false,
              bassAccepted: null,
              optedOut: false,
              dmRefused: false,
              excluded: false,
            },
            tasks: {
              bassAreaCheck: 'UNSTARTED',
              bassOffer: 'DONE',
            },
            stage: 'MODIFIED',
          },
          {},
          null
        )
      ).to.eql([
        { task: 'eligibilitySummaryTask', visible: true },
        {
          action: {
            href: '/hdc/bassReferral/bassOffer/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'WARNING||Address not available',
          title: 'BASS address',
          visible: true,
        },
        {
          action: {
            href: '/hdc/risk/riskManagement/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Risk management',
          visible: true,
        },
        {
          action: {
            href: '/hdc/victim/victimLiaison/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Victim liaison',
          visible: true,
        },
        {
          action: {
            href: '/hdc/curfew/curfewHours/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Curfew hours',
          visible: true,
        },
        {
          action: {
            href: '/hdc/licenceConditions/standard/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Additional conditions',
          visible: true,
        },
        {
          action: {
            href: '/hdc/reporting/reportingInstructions/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Reporting instructions',
          visible: true,
        },
        { task: 'finalChecksTask', visible: true },
        {
          title: 'Postpone or refuse',
          label: "Postpone the case if you're waiting for information on risk management",
          action: {
            href: '/hdc/finalChecks/postpone/',
            text: 'Postpone',
            type: 'btn',
          },
          visible: true,
        },
        {
          label: 'Refuse the case if there is no available address or not enough time',
          title: null,
          action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
          visible: true,
        },
        {
          action: null,
          title: 'Create licence',
          visible: true,
        },
      ])
    })

    it('should return just eligibility and notice if ineligible ', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              eligible: false,
              curfewAddressApproved: true,
              bassReferralNeeded: true,
              bassWithdrawn: false,
              bassExcluded: false,
              bassAccepted: null,
              optedOut: false,
              dmRefused: false,
            },
            tasks: {
              bassAreaCheck: 'UNSTARTED',
              bassOffer: 'DONE',
            },
            stage: 'MODIFIED_APPROVAL',
          },
          {},
          null
        )
      ).to.eql([{ task: 'eligibilitySummaryTask', visible: true }, { task: 'informOffenderTask', visible: true }])
    })

    it('should send for refusal if no approved address and no new one added', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              eligible: true,
              curfewAddressApproved: false,
              bassReferralNeeded: false,
              bassWithdrawn: false,
              bassExcluded: false,
              bassAccepted: null,
              optedOut: false,
              dmRefused: false,
            },
            tasks: {},
            stage: 'DECIDED',
          },
          {},
          'caToDmRefusal'
        )
      ).to.eql([
        {
          action: {
            href: '/hdc/review/address/',
            text: 'View/Edit',
            type: 'btn-secondary',
          },
          label: 'Not completed',
          title: 'Proposed curfew address',
          visible: true,
        },
        {
          label: 'Refuse the case if there is no available address or not enough time',
          title: null,
          action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
          visible: true,
        },
        {
          action: {
            href: '/hdc/send/refusal/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Ready to submit for refusal',
          title: 'Submit to decision maker',
          visible: true,
        },
      ])
    })

    it('should show proposed address task if caToRo transition (new address added)', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              eligible: true,
              curfewAddressApproved: false,
              bassReferralNeeded: false,
              bassWithdrawn: false,
              bassExcluded: false,
              bassAccepted: null,
              optedOut: false,
              dmRefused: false,
            },
            tasks: {
              bassAreaCheck: 'UNSTARTED',
              bassOffer: 'DONE',
            },
            stage: 'DECIDED',
          },
          {},
          'caToRo'
        )
      ).to.eql([
        {
          action: {
            href: '/hdc/proposedAddress/curfewAddressChoice/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Curfew address',
          visible: true,
        },
        {
          label: 'Refuse the case if there is no available address or not enough time',
          title: null,
          action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
          visible: true,
        },
        {
          action: null,
          label: 'Not completed',
          title: 'Submit curfew address',
          visible: true,
        },
      ])
    })
  })

  describe('roTasksPostApproval', () => {
    it('should return four taskes', () => {
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
      ).to.eql([
        {
          title: 'Risk management',
          label: 'Not completed',
          action: { type: 'btn', text: 'Continue', href: '/hdc/risk/riskManagement/' },
        },
        {
          title: 'Curfew hours',
          label: 'Not completed',
          action: { type: 'btn', text: 'Continue', href: '/hdc/curfew/curfewHours/' },
        },
        {
          title: 'Additional conditions',
          label: 'Not completed',
          action: { type: 'btn', text: 'Continue', href: '/hdc/licenceConditions/standard/' },
        },
        {
          title: 'Reporting instructions',
          label: 'Not completed',
          action: { type: 'btn', text: 'Continue', href: '/hdc/reporting/reportingInstructions/' },
        },
      ])
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
      ).to.eql([{ task: 'varyLicenceTask', visible: true }])
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
        {
          title: 'Permission for variation',
          action: { type: 'link', text: 'Change', href: '/hdc/vary/evidence/' },
          visible: true,
        },
        {
          title: 'Curfew address',
          action: { type: 'link', text: 'Change', href: '/hdc/vary/address/' },
          visible: true,
        },
        {
          title: 'Additional conditions',
          action: { type: 'link', text: 'Change', href: '/hdc/licenceConditions/standard/' },
          visible: true,
        },
        {
          title: 'Curfew hours',
          action: { type: 'link', text: 'Change', href: '/hdc/curfew/curfewHours/' },
          visible: true,
        },
        {
          title: 'Reporting instructions',
          action: { type: 'link', text: 'Change', href: '/hdc/vary/reportingAddress/' },
          visible: true,
        },
        {
          title: 'Create licence',
          label: 'Ready to create version 1',
          action: { type: 'btn', href: '/hdc/pdf/select/', text: 'Continue' },
          visible: true,
        },
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
        {
          title: 'View current licence',
          label: 'Licence version 2',
          action: { type: 'btn', href: '/hdc/pdf/create/templateName/', text: 'View', newTab: true },
          visible: true,
        },
        {
          title: 'Permission for variation',
          action: { type: 'link', text: 'Change', href: '/hdc/vary/evidence/' },
          visible: true,
        },
        {
          title: 'Curfew address',
          action: { type: 'link', text: 'Change', href: '/hdc/vary/address/' },
          visible: true,
        },
        {
          title: 'Additional conditions',
          action: { type: 'link', text: 'Change', href: '/hdc/licenceConditions/standard/' },
          visible: true,
        },
        {
          title: 'Curfew hours',
          action: { type: 'link', text: 'Change', href: '/hdc/curfew/curfewHours/' },
          visible: true,
        },
        {
          title: 'Reporting instructions',
          action: { type: 'link', text: 'Change', href: '/hdc/vary/reportingAddress/' },
          visible: true,
        },
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
        {
          title: 'Permission for variation',
          action: { type: 'link', text: 'Change', href: '/hdc/vary/evidence/' },
          visible: true,
        },
        {
          title: 'Curfew address',
          action: { type: 'link', text: 'Change', href: '/hdc/vary/address/' },
          visible: true,
        },
        {
          title: 'Additional conditions',
          action: { type: 'link', text: 'Change', href: '/hdc/licenceConditions/standard/' },
          visible: true,
        },
        {
          title: 'Curfew hours',
          action: { type: 'link', text: 'Change', href: '/hdc/curfew/curfewHours/' },
          visible: true,
        },
        {
          title: 'Reporting instructions',
          action: { type: 'link', text: 'Change', href: '/hdc/vary/reportingAddress/' },
          visible: true,
        },
        {
          title: 'Create licence',
          label: 'Ready to create version 2.2',
          action: { type: 'btn', href: '/hdc/pdf/select/', text: 'Continue' },
          visible: true,
        },
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
        {
          title: 'Permission for variation',
          action: { type: 'link', text: 'Change', href: '/hdc/vary/evidence/' },
          visible: true,
        },
        {
          title: 'Curfew address',
          action: { type: 'link', text: 'Change', href: '/hdc/vary/address/' },
          visible: true,
        },
        {
          title: 'Additional conditions',
          action: { type: 'link', text: 'Change', href: '/hdc/licenceConditions/standard/' },
          visible: true,
        },
        {
          title: 'Curfew hours',
          action: { type: 'link', text: 'Change', href: '/hdc/curfew/curfewHours/' },
          visible: true,
        },
        {
          title: 'Reporting instructions',
          action: { type: 'link', text: 'Change', href: '/hdc/vary/reportingAddress/' },
          visible: true,
        },
        {
          title: 'Create licence',
          label: 'Ready to create version 1.2',
          action: { type: 'btn', href: '/hdc/pdf/select/', text: 'Continue' },
          visible: true,
        },
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
        {
          action: {
            href: '/hdc/curfew/curfewAddressReview/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Proposed curfew address',
          visible: true,
        },
        {
          action: {
            href: '/hdc/risk/riskManagement/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Risk management',
          visible: true,
        },
        {
          action: {
            href: '/hdc/victim/victimLiaison/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Victim liaison',
          visible: true,
        },
        {
          action: {
            href: '/hdc/curfew/curfewHours/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Curfew hours',
          visible: true,
        },
        {
          action: {
            href: '/hdc/licenceConditions/standard/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Additional conditions',
          visible: true,
        },
        {
          action: {
            href: '/hdc/reporting/reportingInstructions/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Reporting instructions',
          visible: true,
        },
        {
          action: {
            href: '/hdc/review/licenceDetails/',
            text: 'Continue',
            type: 'btn',
          },
          title: 'Submit to prison case admin',
          label: 'Ready to submit',
          visible: true,
        },
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
        {
          action: {
            href: '/hdc/risk/riskManagement/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Risk management',
          visible: true,
        },
        {
          action: {
            href: '/hdc/victim/victimLiaison/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Victim liaison',
          visible: true,
        },
        {
          action: {
            href: '/hdc/curfew/curfewHours/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Curfew hours',
          visible: true,
        },
        {
          action: {
            href: '/hdc/licenceConditions/standard/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Additional conditions',
          visible: true,
        },
        {
          action: {
            href: '/hdc/reporting/reportingInstructions/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Not completed',
          title: 'Reporting instructions',
          visible: true,
        },
        {
          action: {
            href: '/hdc/review/licenceDetails/',
            text: 'Continue',
            type: 'btn',
          },
          title: 'Submit to prison case admin',
          label: 'Ready to submit',
          visible: true,
        },
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
      ).to.eql([
        {
          action: {
            href: '/hdc/curfew/curfewAddressReview/',
            text: 'Change',
            type: 'link',
          },
          label: 'Address rejected',
          title: 'Proposed curfew address',
          visible: true,
        },
        {
          action: {
            href: '/hdc/review/licenceDetails/',
            text: 'Continue',
            type: 'btn',
          },
          title: 'Submit to prison case admin',
          label: 'Ready to submit',
          visible: true,
        },
      ])
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
      ).to.eql([
        {
          action: {
            href: '/hdc/risk/riskManagement/',
            text: 'Continue',
            type: 'btn',
          },
          label: 'Address unsuitable',
          title: 'Risk management',
          visible: true,
        },
        {
          action: {
            href: '/hdc/review/licenceDetails/',
            text: 'Continue',
            type: 'btn',
          },
          title: 'Submit to prison case admin',
          label: 'Ready to submit',
          visible: true,
        },
      ])
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
        {
          action: {
            href: '/hdc/review/licenceDetails/',
            text: 'Continue',
            type: 'btn',
          },
          title: 'Submit to prison case admin',
          label: 'Ready to submit',
          visible: true,
        },
      ])
    })
  })

  describe('dmTasks', () => {
    const eligibilitySummary = { task: 'eligibilitySummaryTask' }
    const returnPCA = {
      title: 'Return to prison case admin',
      action: { type: 'btn-secondary', href: '/hdc/send/return/', text: 'Return to prison case admin' },
    }
    const risk = {
      title: 'Risk management',
      label: 'Not completed',
      action: { href: '/hdc/review/risk/', text: 'View', type: 'btn-secondary' },
    }
    const victim = {
      title: 'Victim liaison',
      label: 'Not completed',
      action: { href: '/hdc/review/victimLiaison/', text: 'View', type: 'btn-secondary' },
    }
    const curfew = {
      title: 'Curfew hours',
      label: 'Not completed',
      action: { href: '/hdc/review/curfewHours/', text: 'View', type: 'btn-secondary' },
    }
    const conditions = {
      title: 'Additional conditions',
      label: 'Not completed',
      action: { href: '/hdc/review/conditions/', text: 'View', type: 'btn-secondary' },
    }
    const reporting = {
      title: 'Reporting instructions',
      label: 'Not completed',
      action: { href: '/hdc/review/reporting/', text: 'View', type: 'btn-secondary' },
    }
    const review = {
      title: 'Review case',
      label: 'Not completed',
      action: { type: 'btn-secondary', href: '/hdc/review/finalChecks/', text: 'View' },
    }
    const release = {
      title: 'Final decision',
      label: 'Not started',
      action: { href: '/hdc/approval/release/', text: 'Continue', type: 'btn' },
    }
    const bass = {
      title: 'BASS address',
      label: 'BASS referral requested',
      action: { href: '/hdc/review/bassOffer/', text: 'View', type: 'btn-secondary' },
    }

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
      ).to.eql([
        eligibilitySummary,
        {
          title: 'Final decision',
          label: 'Awaiting refusal',
          action: { href: '/hdc/approval/refuseReason/', text: 'Refuse HDC', type: 'btn' },
        },
      ])
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
      ).to.eql([
        eligibilitySummary,
        {
          title: 'Proposed curfew address',
          label: 'Address withdrawn',
          action: { type: 'btn-secondary', href: '/hdc/review/address/', text: 'View' },
        },
        returnPCA,
        {
          title: 'Final decision',
          label: 'Not started',
          action: { href: '/hdc/approval/refuseReason/', text: 'Refuse HDC', type: 'btn' },
        },
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
              curfewAddressRejected: true,
            },
            tasks: {},
            stage: 'APPROVAL',
          },
          {},
          null
        )
      ).to.eql([
        eligibilitySummary,
        {
          title: 'Proposed curfew address',
          label: 'Not completed',
          action: { type: 'btn-secondary', href: '/hdc/review/address/', text: 'View' },
        },
        returnPCA,
        {
          title: 'Final decision',
          label: 'Not started',
          action: { href: '/hdc/approval/refuseReason/', text: 'Refuse HDC', type: 'btn' },
        },
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
        {
          title: 'Proposed curfew address',
          label: 'Not completed',
          action: { href: '/hdc/review/address/', text: 'View', type: 'btn-secondary' },
        },
        risk,
        victim,
        curfew,
        conditions,
        reporting,
        review,
        returnPCA,
        release,
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
      ).to.eql([bass, risk, victim, curfew, conditions, reporting, review, returnPCA, release])
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
        bass,
        risk,
        victim,
        curfew,
        conditions,
        reporting,
        {
          title: 'Review case',
          label: 'WARNING||The offender is subject to a confiscation order',
          action: { type: 'btn-secondary', href: '/hdc/review/finalChecks/', text: 'View' },
        },
        {
          title: 'Postpone',
          label: 'Use this to indicate that the process is postponed if a confiscation order is in place',
          action: { href: '/hdc/finalChecks/postpone/', text: 'Postpone', type: 'btn' },
        },
        returnPCA,
        release,
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
