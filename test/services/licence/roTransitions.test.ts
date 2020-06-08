import getAllowedTransition from '../../../server/services/licence/roTransitions'
import { taskState } from '../../../server/services/config/taskState'
import { licenceStage } from '../../../server/services/config/licenceStage'

describe('getAllowedTransition', () => {
  describe('RO to CA', () => {
    test('should allow RO to CA for RO when all RO tasks done', () => {
      const status = {
        stage: licenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: taskState.DONE,
          curfewHours: taskState.DONE,
          licenceConditions: taskState.DONE,
          riskManagement: taskState.DONE,
          victim: taskState.DONE,
          reportingInstructions: taskState.DONE,
        },
        decisions: {},
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('roToCa')
    })

    test('should allow RO to CA for RO if risk not done when approved premises', () => {
      const status = {
        stage: licenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: taskState.DONE,
          curfewHours: taskState.DONE,
          licenceConditions: taskState.DONE,
          riskManagement: taskState.UNSTARTED,
          victim: taskState.DONE,
          reportingInstructions: taskState.DONE,
        },
        decisions: {
          approvedPremisesRequired: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('roToCa')
    })

    test('should not allow RO to CA for RO if risk not done when not approved premises', () => {
      const status = {
        stage: licenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: taskState.DONE,
          curfewHours: taskState.DONE,
          licenceConditions: taskState.DONE,
          riskManagement: taskState.UNSTARTED,
          victim: taskState.DONE,
          reportingInstructions: taskState.DONE,
        },
        decisions: {
          approvedPremisesRequired: false,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe(null)
    })

    test('should not allow RO to CA for RO when any RO tasks not done', () => {
      const status = {
        stage: licenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: taskState.DONE,
          curfewHours: taskState.DONE,
          licenceConditions: taskState.DONE,
          riskManagement: taskState.UNSTARTED,
          reportingInstructions: taskState.DONE,
        },
        decisions: {},
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe(null)
    })

    test('should allow RO to CA for RO when address rejected even when other tasks not done', () => {
      const status = {
        stage: licenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: taskState.DONE,
          curfewHours: taskState.UNSTARTED,
          licenceConditions: taskState.UNSTARTED,
          riskManagement: taskState.UNSTARTED,
          reportingInstructions: taskState.UNSTARTED,
        },
        decisions: {
          curfewAddressRejected: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('roToCa')
    })

    test('should allow RO to CA for RO when opted out even when other tasks not done', () => {
      const status = {
        stage: licenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: taskState.DONE,
          curfewHours: taskState.UNSTARTED,
          licenceConditions: taskState.UNSTARTED,
          riskManagement: taskState.UNSTARTED,
          reportingInstructions: taskState.UNSTARTED,
        },
        decisions: {
          optedOut: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('roToCa')
    })

    test('should allow RO to CA for RO when bass area rejected even when other tasks not done', () => {
      const status = {
        stage: licenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: taskState.DONE,
          bassAreaCheck: taskState.DONE,
          curfewHours: taskState.UNSTARTED,
          licenceConditions: taskState.UNSTARTED,
          riskManagement: taskState.UNSTARTED,
          reportingInstructions: taskState.UNSTARTED,
        },
        decisions: {
          bassReferralNeeded: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('roToCa')
    })

    test('should not allow RO to CA for RO when address undecided', () => {
      const status = {
        stage: licenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: taskState.DONE,
          curfewHours: taskState.UNSTARTED,
          licenceConditions: taskState.UNSTARTED,
          riskManagement: taskState.UNSTARTED,
          reportingInstructions: taskState.UNSTARTED,
        },
        decisions: {},
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe(null)
    })
  })
})
