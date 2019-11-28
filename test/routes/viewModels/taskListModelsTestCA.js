const taskListModel = require('../../../server/routes/viewModels/taskListModels')

describe('TaskList models', () => {
  const eligibility = { task: 'eligibilityTask', visible: true }

  const informOffender = {
    action: {
      href: '/caseList/active',
      text: 'Back to case list',
      type: 'btn-secondary',
    },
    label: 'You should now tell the offender using the relevant HDC form from NOMIS',
    title: 'Inform the offender',
    visible: true,
  }
  const informOffenderStandard = { task: 'informOffenderTask', visible: true }

  const curfewAddress = {
    action: {
      href: '/hdc/proposedAddress/curfewAddressChoice/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Not completed',
    title: 'Curfew address',
    visible: true,
  }
  const curfewAddressAddressRejected = {
    action: {
      href: '/hdc/proposedAddress/rejected/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Not completed',
    title: 'Curfew address',
    visible: true,
  }
  const curfewAddressOptedOut = {
    action: {
      href: '/hdc/proposedAddress/curfewAddressChoice/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Offender has opted out of HDC',
    title: 'Curfew address',
    visible: true,
  }

  const submitCurfewAddress = {
    action: null,
    label: 'Not completed',
    title: 'Submit curfew address',
    visible: true,
  }
  const submitDecisionMakerRefusal = {
    action: {
      href: '/hdc/send/refusal/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Ready to submit for refusal',
    title: 'Submit to decision maker',
    visible: true,
  }
  const sendBassAreaChecks = {
    action: null,
    label: 'Not completed',
    title: 'Send for BASS area checks',
    visible: true,
  }
  const submitDecisionMaker = {
    action: null,
    label: 'Not completed',
    title: 'Submit to decision maker',
    visible: true,
  }

  const proposedCurfewAddress = {
    action: {
      href: '/hdc/review/address/',
      text: 'Change',
      type: 'link',
    },
    label: 'Not completed',
    title: 'Proposed curfew address',
    visible: true,
  }
  const proposedCurfewAddressOptedOut = {
    title: 'Proposed curfew address',
    label: 'Opted out',
    action: {
      href: '/hdc/proposedAddress/curfewAddressChoice/',
      text: 'Change',
      type: 'link',
    },
    visible: true,
  }
  const proposedCurfewAddressEdit = {
    action: {
      href: '/hdc/review/address/',
      text: 'View/Edit',
      type: 'btn-secondary',
    },
    label: 'Not completed',
    title: 'Proposed curfew address',
    visible: true,
  }
  const proposedCurfewAddressEditAP = {
    action: {
      href: '/hdc/curfew/approvedPremisesChoice/',
      text: 'View/Edit',
      type: 'btn-secondary',
    },
    label: 'Approved premises required',
    title: 'Proposed curfew address',
    visible: true,
  }

  const bassAddress = {
    title: 'BASS address',
    label: 'BASS referral requested',
    action: {
      href: '/hdc/bassReferral/bassOffer/',
      text: 'Continue',
      type: 'btn',
    },
    visible: true,
  }
  const bassAddressRejected = {
    title: 'BASS address',
    label: 'BASS referral requested',
    action: {
      href: '/hdc/proposedAddress/curfewAddressChoice/',
      text: 'Continue',
      type: 'btn',
    },
    visible: true,
  }

  const bassAddressWithApprovedAddress = {
    title: 'BASS address',
    label: 'Approved premises required',
    action: {
      href: '/hdc/bassReferral/approvedPremisesChoice/',
      text: 'View/Edit',
      type: 'btn-secondary',
    },
    visible: true,
  }

  const riskManagement = {
    action: {
      href: '/hdc/risk/riskManagement/',
      text: 'View/Edit',
      type: 'btn-secondary',
    },
    label: 'Not completed',
    title: 'Risk management',
    visible: true,
  }
  const riskManagementAddressUnsuitable = {
    action: {
      href: '/hdc/risk/riskManagement/',
      text: 'View/Edit',
      type: 'btn-secondary',
    },
    label: 'Address unsuitable',
    title: 'Risk management',
    visible: true,
  }

  const victimLiasion = {
    action: {
      href: '/hdc/victim/victimLiaison/',
      text: 'View/Edit',
      type: 'btn-secondary',
    },
    label: 'Not completed',
    title: 'Victim liaison',
    visible: true,
  }

  const curfewHours = {
    action: {
      href: '/hdc/curfew/curfewHours/',
      text: 'View/Edit',
      type: 'btn-secondary',
    },
    label: 'Not completed',
    title: 'Curfew hours',
    visible: true,
  }

  const additionalConditionsEdit = {
    action: {
      href: '/hdc/licenceConditions/standard/',
      text: 'View/Edit',
      type: 'btn-secondary',
    },
    label: 'Not completed',
    title: 'Additional conditions',
    visible: true,
  }

  const reportingInstructionsReview = {
    action: {
      href: '/hdc/reporting/reportingInstructions/',
      text: 'View/Edit',
      type: 'btn-secondary',
    },
    label: 'Not completed',
    title: 'Reporting instructions',
    visible: true,
  }
  const reportingInstructions = {
    action: {
      href: '/hdc/reporting/reportingInstructions/',
      text: 'View/Edit',
      type: 'btn-secondary',
    },
    label: 'Not completed',
    title: 'Reporting instructions',
    visible: true,
  }

  const reviewCase = {
    action: {
      href: '/hdc/finalChecks/seriousOffence/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Not completed',
    title: 'Review case',
    visible: true,
  }

  const postponeOrRefuse = {
    label: "Postpone the case if you're waiting for information on risk management",
    title: 'Postpone or refuse',
    action: { type: 'btn', text: 'Postpone', href: '/hdc/finalChecks/postpone/' },
    visible: true,
  }

  const refuse = {
    label: 'Refuse the case if there is no available address or not enough time',
    title: null,
    action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/' },
    visible: true,
  }

  const eligibilitySummary = { task: 'eligibilitySummaryTask', visible: true }

  const createLicence = {
    action: null,
    title: 'Create licence',
    visible: true,
  }

  const bassAddressNoAddress = {
    action: {
      href: '/hdc/bassReferral/bassOffer/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'WARNING||Address not available',
    title: 'BASS address',
    visible: true,
  }

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
      ).to.eql([eligibility])
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
      ).to.eql([eligibility, informOffender, curfewAddress])
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
      ).to.eql([eligibility, curfewAddress, submitCurfewAddress])
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
      ).to.eql([eligibility, curfewAddress, sendBassAreaChecks])
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
      ).to.eql([eligibility, curfewAddressOptedOut])
    })

    it('should allow submission for refusal if ineligible', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: true,
              optedOut: false,
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
      ).to.eql([eligibility, submitDecisionMakerRefusal])
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
      ).to.eql([eligibility, curfewAddressAddressRejected, submitDecisionMakerRefusal])
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
        proposedCurfewAddress,
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditionsEdit,
        reportingInstructionsReview,
        reviewCase,
        postponeOrRefuse,
        refuse,
        submitDecisionMaker,
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
      ).to.eql([proposedCurfewAddress, refuse, submitDecisionMakerRefusal])
    })

    it('should show risk if address unsuitable', () => {
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
      ).to.eql([proposedCurfewAddress, riskManagementAddressUnsuitable, refuse, submitDecisionMakerRefusal])
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
        bassAddress,
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditionsEdit,
        reportingInstructionsReview,
        reviewCase,
        postponeOrRefuse,
        refuse,
        submitDecisionMaker,
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
              optedOut: true,
            },
            tasks: {},
            stage: 'PROCESSING_CA',
          },
          {},
          'caToDm'
        )
      ).to.eql([proposedCurfewAddressOptedOut, refuse])
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
      ).to.eql([bassAddressRejected, refuse, submitDecisionMakerRefusal])
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
      ).to.eql([bassAddress, refuse, submitDecisionMakerRefusal])
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
      ).to.eql([curfewAddress, refuse, submitCurfewAddress])
    })

    it('should show  Bass Address task with Approved Premises label and View/Edit button if AP input)', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: true,
              approvedPremisesRequired: true,
            },
            tasks: {
              approvedPremisesAddress: 'DONE',
              bassAreaCheck: 'DONE',
            },
            stage: 'PROCESSING_CA',
          },
          { approvedPremisesAddress: 'DONE' },
          'null'
        )
      ).to.eql([
        bassAddressWithApprovedAddress,
        victimLiasion,
        curfewHours,
        additionalConditionsEdit,
        reportingInstructionsReview,
        reviewCase,
        postponeOrRefuse,
        refuse,
        submitDecisionMaker,
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
        eligibilitySummary,
        proposedCurfewAddressEdit,
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditionsEdit,
        reportingInstructions,
        reviewCase,
        postponeOrRefuse,
        refuse,
        createLicence,
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
        eligibilitySummary,
        bassAddressNoAddress,
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditionsEdit,
        reportingInstructions,
        reviewCase,
        postponeOrRefuse,
        refuse,
        createLicence,
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
      ).to.eql([eligibilitySummary, informOffenderStandard])
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
      ).to.eql([proposedCurfewAddressEdit, refuse, submitDecisionMakerRefusal])
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
      ).to.eql([curfewAddress, refuse, submitCurfewAddress])
    })

    it('should return list of tasks excluding risk when approved premises required', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              eligible: true,
              approvedPremisesRequired: true,
              bassReferralNeeded: false,
              bassWithdrawn: false,
              bassExcluded: false,
              bassAccepted: null,
              optedOut: false,
              dmRefused: false,
              excluded: false,
            },
            tasks: {
              approvedPremisesAddress: 'DONE',
            },
            stage: 'DECIDED',
          },
          {},
          null
        )
      ).to.eql([
        eligibilitySummary,
        proposedCurfewAddressEditAP,
        victimLiasion,
        curfewHours,
        additionalConditionsEdit,
        reportingInstructions,
        reviewCase,
        postponeOrRefuse,
        refuse,
        createLicence,
      ])
    })
  })
})
