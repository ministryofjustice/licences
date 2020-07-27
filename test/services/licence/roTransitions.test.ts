import getAllowedTransition from '../../../server/services/licence/roTransitions'
import { TaskState } from '../../../server/services/config/taskState'
import { LicenceStage } from '../../../server/services/config/licenceStage'

describe('getAllowedTransition', () => {
  describe('RO to CA', () => {
    test('should allow RO to CA for RO when all RO tasks done', () => {
      const status = {
        stage: LicenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: TaskState.DONE,
          curfewHours: TaskState.DONE,
          licenceConditions: TaskState.DONE,
          riskManagement: TaskState.DONE,
          victim: TaskState.DONE,
          reportingInstructions: TaskState.DONE,
        },
        decisions: {},
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('roToCa')
    })

    test('should allow RO to CA for RO if risk not done when approved premises', () => {
      const status = {
        stage: LicenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: TaskState.DONE,
          curfewHours: TaskState.DONE,
          licenceConditions: TaskState.DONE,
          riskManagement: TaskState.UNSTARTED,
          victim: TaskState.DONE,
          reportingInstructions: TaskState.DONE,
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
        stage: LicenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: TaskState.DONE,
          curfewHours: TaskState.DONE,
          licenceConditions: TaskState.DONE,
          riskManagement: TaskState.UNSTARTED,
          victim: TaskState.DONE,
          reportingInstructions: TaskState.DONE,
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
        stage: LicenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: TaskState.DONE,
          curfewHours: TaskState.DONE,
          licenceConditions: TaskState.DONE,
          riskManagement: TaskState.UNSTARTED,
          reportingInstructions: TaskState.DONE,
        },
        decisions: {},
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe(null)
    })

    test('should allow RO to CA for RO when address rejected even when other tasks not done', () => {
      const status = {
        stage: LicenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: TaskState.DONE,
          curfewHours: TaskState.UNSTARTED,
          licenceConditions: TaskState.UNSTARTED,
          riskManagement: TaskState.UNSTARTED,
          reportingInstructions: TaskState.UNSTARTED,
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
        stage: LicenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: TaskState.DONE,
          curfewHours: TaskState.UNSTARTED,
          licenceConditions: TaskState.UNSTARTED,
          riskManagement: TaskState.UNSTARTED,
          reportingInstructions: TaskState.UNSTARTED,
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
        stage: LicenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: TaskState.DONE,
          bassAreaCheck: TaskState.DONE,
          curfewHours: TaskState.UNSTARTED,
          licenceConditions: TaskState.UNSTARTED,
          riskManagement: TaskState.UNSTARTED,
          reportingInstructions: TaskState.UNSTARTED,
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
        stage: LicenceStage.PROCESSING_RO,
        postApproval: true,
        tasks: {
          curfewAddressReview: TaskState.DONE,
          curfewHours: TaskState.UNSTARTED,
          licenceConditions: TaskState.UNSTARTED,
          riskManagement: TaskState.UNSTARTED,
          reportingInstructions: TaskState.UNSTARTED,
        },
        decisions: {},
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe(null)
    })
  })
})
