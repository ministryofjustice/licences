const taskListModel = require('../../../server/routes/viewModels/taskListModels')

describe('TaskList models', () => {
  const eligibility = { task: 'eligibilityTask' }

  const informOffender = {
    action: {
      href: '/caseList/active',
      text: 'Back to case list',
      type: 'btn-secondary',
    },
    label: 'You should now tell the offender using the relevant HDC form',
    title: 'Inform the offender',
  }

  const curfewAddress = {
    action: {
      href: '/hdc/proposedAddress/curfewAddressChoice/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Not completed',
    title: 'Curfew address',
  }
  const curfewAddressAddressRejected = {
    action: {
      href: '/hdc/proposedAddress/rejected/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Not completed',
    title: 'Curfew address',
  }
  const curfewAddressOptedOut = {
    action: {
      href: '/hdc/proposedAddress/curfewAddressChoice/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Offender has opted out of HDC',
    title: 'Curfew address',
  }

  const submitCurfewAddress = {
    action: null,
    label: 'Not completed',
    title: 'Submit curfew address',
  }
  const submitDecisionMakerRefusal = {
    action: {
      href: '/hdc/send/refusal/',
      text: 'Continue',
      type: 'btn',
      dataQa: 'continue',
    },
    label: 'Ready to submit for refusal',
    title: 'Submit to decision maker',
  }
  const sendBassAreaChecks = {
    action: null,
    label: 'Not completed',
    title: 'Send for CAS2 area checks',
  }
  const submitDecisionMaker = {
    action: null,
    label: 'Not completed',
    title: 'Submit to decision maker',
  }
  const proposedCurfewAddress = {
    action: {
      href: '/hdc/review/address/',
      text: 'Change',
      type: 'link',
      dataQa: 'proposed-curfew-address',
    },
    label: 'Not completed',
    title: 'Proposed curfew address',
  }
  const proposedCurfewAddressOptedOut = {
    title: 'Proposed curfew address',
    label: 'Opted out',
    action: {
      href: '/hdc/proposedAddress/curfewAddressChoice/',
      text: 'Change',
      type: 'link',
      dataQa: 'proposed-curfew-address',
    },
  }
  const proposedCurfewAddressEdit = {
    action: {
      href: '/hdc/review/address/',
      text: 'View/Edit',
      type: 'btn-secondary',
      dataQa: 'proposed-curfew-address',
    },
    label: 'Not completed',
    title: 'Proposed curfew address',
  }
  const proposedCurfewAddressEditAP = {
    action: {
      href: '/hdc/curfew/approvedPremisesChoice/',
      text: 'View/Edit',
      type: 'btn-secondary',
      dataQa: 'proposed-curfew-address',
    },
    label: 'Approved premises required',
    title: 'Proposed curfew address',
  }

  const bassAddress = {
    title: 'BASS address',
    label: 'BASS referral requested',
    action: {
      href: '/hdc/bassReferral/bassOffer/',
      text: 'Continue',
      type: 'btn',
    },
  }
  const bassAddressRejected = {
    title: 'BASS address',
    label: 'BASS referral requested',
    action: {
      href: '/hdc/proposedAddress/curfewAddressChoice/',
      text: 'Continue',
      type: 'btn',
      dataQa: 'bass-address',
    },
  }

  const bassAddressWithApprovedAddress = {
    title: 'BASS address',
    label: 'Approved premises required',
    action: {
      href: '/hdc/bassReferral/approvedPremisesChoice/',
      text: 'View/Edit',
      type: 'btn-secondary',
      dataQa: 'approved-premises-choice',
    },
  }

  const riskManagement = {
    action: {
      href: '/hdc/risk/riskManagement/',
      text: 'View/Edit',
      type: 'btn-secondary',
      dataQa: 'risk-management',
    },
    label: 'Not completed',
    title: 'Risk management',
  }
  const riskManagementAddressUnsuitable = {
    action: {
      href: '/hdc/risk/riskManagement/',
      text: 'View/Edit',
      type: 'btn-secondary',
      dataQa: 'risk-management',
    },
    label: 'Address unsuitable',
    title: 'Risk management',
  }

  const victimLiasion = {
    action: {
      href: '/hdc/victim/victimLiaison/',
      text: 'View/Edit',
      type: 'btn-secondary',
      dataQa: 'victim-liaison',
    },
    label: 'Not completed',
    title: 'Victim liaison',
  }

  const curfewHours = {
    action: {
      href: '/hdc/curfew/curfewHours/',
      text: 'View/Edit',
      type: 'btn-secondary',
      dataQa: 'curfew-hours',
    },
    label: 'Not completed',
    title: 'Curfew hours',
  }

  const additionalConditionsEdit = {
    action: {
      href: '/hdc/licenceConditions/standard/',
      text: 'View/Edit',
      type: 'btn-secondary',
      dataQa: 'additional-conditions',
    },
    label: 'Not completed',
    title: 'Additional conditions',
  }

  const reportingInstructionsReview = {
    action: {
      href: '/hdc/reporting/reportingInstructions/',
      text: 'View/Edit',
      type: 'btn-secondary',
      dataQa: 'reporting-instructions',
    },
    label: 'Not completed',
    title: 'Reporting instructions',
  }

  const reportingInstructions = {
    action: {
      href: '/hdc/reporting/reportingInstructions/',
      text: 'View/Edit',
      type: 'btn-secondary',
      dataQa: 'reporting-instructions',
    },
    label: 'Not completed',
    title: 'Reporting instructions',
  }

  const reviewCase = {
    action: {
      href: '/hdc/finalChecks/seriousOffence/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'Not completed',
    title: 'Review case',
  }

  const postponeOrRefuse = {
    label: "Postpone the case if you're waiting for information on risk management",
    title: 'Postpone or refuse',
    action: { type: 'btn', text: 'Postpone', href: '/hdc/finalChecks/postpone/', dataQa: 'postpone' },
  }

  const resubmit = {
    action: { href: '/hdc/send/resubmit/', text: 'Resubmit', type: 'btn-secondary', dataQa: 'resubmit' },
    label: 'Resubmit to the DM if a reconsideration is required',
    title: 'Resubmit to DM',
  }

  const refuse = {
    label: 'Refuse the case if there is no available address or not enough time',
    title: null,
    action: { type: 'btn-secondary', text: 'Refuse HDC', href: '/hdc/finalChecks/refuse/', dataQa: 'refuse' },
  }

  const eligibilitySummary = { task: 'eligibilitySummaryTask' }

  const createLicence = {
    action: null,
    title: 'Create licence',
  }

  const bassAddressNoAddress = {
    action: {
      href: '/hdc/bassReferral/bassOffer/',
      text: 'Continue',
      type: 'btn',
    },
    label: 'WARNING||Address not available',
    title: 'BASS address',
  }

  describe('caEligibility', () => {
    test('should initially show just eligibility task', () => {
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
          {}
        )
      ).toEqual([eligibility])
    })

    test('should show info and address task after eligibility successfully completed', () => {
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
          {}
        )
      ).toEqual([eligibility, informOffender, curfewAddress])
    })

    test('should allow submission to RO when optout completed and not opted out', () => {
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
          {}
        )
      ).toEqual([eligibility, curfewAddress, submitCurfewAddress])
    })

    test('should allow submission for bass review if bass review selected', () => {
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
          {}
        )
      ).toEqual([eligibility, curfewAddress, sendBassAreaChecks])
    })

    test('should not allow submission for if opted out', () => {
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
          {}
        )
      ).toEqual([eligibility, curfewAddressOptedOut])
    })

    test('should allow submission for refusal if ineligible', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: true,
              optedOut: false,
              insufficientTimeStop: true,
              eligible: false,
            },
            tasks: {
              eligibility: 'DONE',
              optOut: 'DONE',
            },
            stage: 'ELIGIBILITY',
          },
          {}
        )
      ).toEqual([eligibility, submitDecisionMakerRefusal])
    })

    test('should allow submission for refusal if address rejected', () => {
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
          {}
        )
      ).toEqual([eligibility, curfewAddressAddressRejected, submitDecisionMakerRefusal])
    })
  })

  describe('caTasksFinalChecks', () => {
    test('should return list of tasks for standard route', () => {
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
              eligible: true,
            },
            tasks: {
              bassAreaCheck: 'UNSTARTED',
            },
            stage: 'PROCESSING_CA',
          },
          {}
        )
      ).toEqual([
        eligibility,
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

    test('should return a limited set of tasks of curfew address not approved', () => {
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
              eligible: true,
            },
            tasks: {
              bassAreaCheck: 'UNSTARTED',
            },
            stage: 'PROCESSING_CA',
          },
          {}
        )
      ).toEqual([eligibility, proposedCurfewAddress, refuse, submitDecisionMaker])
    })

    test('should show risk if address unsuitable', () => {
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
              eligible: true,
            },
            tasks: {},
            stage: 'PROCESSING_CA',
          },
          {}
        )
      ).toEqual([eligibility, proposedCurfewAddress, riskManagementAddressUnsuitable, refuse, submitDecisionMaker])
    })

    test('should return bass specific list of tasks', () => {
      expect(
        taskListModel('CA', false, {
          decisions: {
            curfewAddressApproved: false,
            bassReferralNeeded: true,
            bassWithdrawn: false,
            bassAccepted: null,
            optedOut: false,
            eligible: true,
          },
          tasks: {
            bassAreaCheck: 'DONE',
          },
          stage: 'PROCESSING_CA',
        })
      ).toEqual([
        eligibility,
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

    test('should not show submit tasks if opted out', () => {
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
          {}
        )
      ).toEqual([proposedCurfewAddressOptedOut, refuse])
    })

    test('should return limited bass specific list of tasks when bass area check not done', () => {
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
              eligible: true,
            },
            tasks: {
              bassAreaCheck: 'UNFINISHED',
            },
            stage: 'PROCESSING_CA',
          },
          {}
        )
      ).toEqual([eligibility, bassAddressRejected, refuse, submitDecisionMaker])
    })

    test('should return limited bass specific list of tasks when bass excluded', () => {
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
              eligible: true,
            },
            tasks: {
              bassAreaCheck: 'DONE',
            },
            stage: 'PROCESSING_CA',
          },
          {}
        )
      ).toEqual([eligibility, bassAddress, refuse, submitDecisionMakerRefusal])
    })

    test('should show proposed address task if caToRo transition - new address added', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: false,
              eligible: true,
            },
            tasks: {},
            stage: 'PROCESSING_CA',
          },
          {}
        )
      ).toEqual([eligibility, proposedCurfewAddress, refuse, submitDecisionMaker])
    })

    test('should show  Bass Address task with Approved Premises label and View/Edit button if AP input', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              bassReferralNeeded: true,
              approvedPremisesRequired: true,
              eligible: true,
            },
            tasks: {
              approvedPremisesAddress: 'DONE',
              bassAreaCheck: 'DONE',
            },
            stage: 'PROCESSING_CA',
          },
          {}
        )
      ).toEqual([
        eligibility,
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

    test('Should show the eligiblity task list if Offender is made ineligible at the PROCESSING_CA stage', () => {
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
              eligible: false,
            },
            tasks: {
              bassAreaCheck: 'UNSTARTED',
            },
            stage: 'PROCESSING_CA',
          },
          {}
        )
      ).toEqual([eligibility, informOffender])
    })
  })

  describe('caTasksPostApproval', () => {
    test('should return list of tasks for standard route', () => {
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
          {}
        )
      ).toEqual([
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
        resubmit,
        createLicence,
      ])
    })

    test('should return list of tasks for standard route - postponed', () => {
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
              postponed: true,
            },
            tasks: {
              bassAreaCheck: 'UNSTARTED',
              bassOffer: 'UNSTARTED',
            },
            stage: 'DECIDED',
          },
          {}
        )
      ).toEqual([
        eligibilitySummary,
        proposedCurfewAddressEdit,
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditionsEdit,
        reportingInstructions,
        reviewCase,
        {
          ...postponeOrRefuse,
          action: { ...postponeOrRefuse.action, text: 'Resume' },
          label: 'HDC application postponed',
        },
        refuse,
        resubmit,
      ])
    })

    test('should return bass tasks if required', () => {
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
              bassAccepted: 'Unavailable',
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
          {}
        )
      ).toEqual([
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
        submitDecisionMakerRefusal,
      ])
    })

    test('should return bass tasks if required', () => {
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
              bassAccepted: 'Unavailable',
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
          {}
        )
      ).toEqual([
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
        submitDecisionMakerRefusal,
      ])
    })

    test('should return just eligibility and notice if ineligible ', () => {
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
          {}
        )
      ).toEqual([eligibilitySummary, informOffender])
    })

    test('should send for refusal if no approved address and no new one added', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              eligible: true,
              curfewAddressApproved: false,
              curfewAddressRejected: true,
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
          {}
        )
      ).toEqual([proposedCurfewAddressEdit, refuse, submitDecisionMakerRefusal])
    })

    test('should show proposed address task if caToRo transition - new address added', () => {
      expect(
        taskListModel(
          'CA',
          false,
          {
            decisions: {
              approvedPremisesRequired: false,
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
              curfewAddressReview: 'UNSTARTED',
            },
            stage: 'PROCESSING_CA',
          },
          {}
        )
      ).toEqual([eligibility, curfewAddress, refuse, submitCurfewAddress])
    })

    test('should return list of tasks excluding risk when approved premises required', () => {
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
          {}
        )
      ).toEqual([
        eligibilitySummary,
        proposedCurfewAddressEditAP,
        victimLiasion,
        curfewHours,
        additionalConditionsEdit,
        reportingInstructions,
        reviewCase,
        postponeOrRefuse,
        refuse,
        resubmit,
        createLicence,
      ])
    })
    test('should return list of tasks for standard route excluding resubmit to DM', () => {
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
              dmRefused: undefined,
              excluded: false,
            },
            tasks: {
              bassAreaCheck: 'UNSTARTED',
              bassOffer: 'UNSTARTED',
            },
            stage: 'PROCESSING_CA',
          },
          {}
        )
      ).toEqual([
        eligibility,
        proposedCurfewAddress,
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditionsEdit,
        reportingInstructions,
        reviewCase,
        postponeOrRefuse,
        refuse,
        submitDecisionMaker,
      ])
    })

    test('should return list of tasks for standard route INCLUDING resubmit BUT EXCLUDING Postpone or Refuse', () => {
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
              dmRefused: true,
              excluded: false,
            },
            tasks: {
              bassAreaCheck: 'UNSTARTED',
              bassOffer: 'UNSTARTED',
            },
            stage: 'DECIDED',
          },
          {}
        )
      ).toEqual([
        eligibilitySummary,
        proposedCurfewAddressEdit,
        riskManagement,
        victimLiasion,
        curfewHours,
        additionalConditionsEdit,
        reportingInstructions,
        reviewCase,
        resubmit,
      ])
    })
  })

  test('should return list of tasks for standard route INCLUDING resubmit AND Postpone or Refuse', () => {
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
        {}
      )
    ).toEqual([
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
      resubmit,
      createLicence,
    ])
  })
})
