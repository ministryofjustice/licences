import getAllowedTransition from '../../../server/services/licence/caTransitions'
import { TaskState } from '../../../server/services/config/taskState'
import { LicenceStage } from '../../../server/services/config/licenceStage'

describe('getAllowedTransition', () => {
  describe('CA to RO', () => {
    test('should allow CA to RO in the ELIGIBILITY stage when all CA tasks done and decisions OK', () => {
      const status = {
        stage: LicenceStage.ELIGIBILITY,
        postApproval: false,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.DONE,
          optOut: TaskState.DONE,
          curfewAddress: TaskState.DONE,
          finalChecks: TaskState.DONE,
        },
        decisions: {
          postponed: null,
          curfewAddressApproved: true,
          excluded: null,
          eligible: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToRo')
    })

    test('should not allow CA to RO in the ELIGIBILITY stage when HDC has been opted out', () => {
      const status = {
        stage: LicenceStage.ELIGIBILITY,
        postApproval: false,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.DONE,
          optOut: TaskState.DONE,
          bassReferral: TaskState.DONE,
          curfewAddress: TaskState.DONE,
          finalChecks: TaskState.DONE,
        },
        decisions: {
          optedOut: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe(null)
    })

    test('should not allow CA to RO in the ELIGIBILITY stage when address has been rejected', () => {
      const status = {
        stage: LicenceStage.ELIGIBILITY,
        postApproval: false,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.DONE,
          optOut: TaskState.DONE,
          bassReferral: TaskState.DONE,
          curfewAddress: TaskState.DONE,
          finalChecks: TaskState.DONE,
        },
        decisions: {
          curfewAddressApproved: false,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe(null)
    })

    test('should not allow CA to RO in the ELIGIBILITY stage when ineligible', () => {
      const status = {
        stage: LicenceStage.ELIGIBILITY,
        postApproval: false,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.DONE,
          optOut: TaskState.DONE,
          bassReferral: TaskState.DONE,
          curfewAddress: TaskState.DONE,
          finalChecks: TaskState.DONE,
        },
        decisions: {
          postponed: null,
          curfewAddressApproved: true,
          excluded: null,
          eligible: null,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe(null)
    })

    test('should allow CA to RO in the PROCESSING_CA for BASS when BASS area check not done', () => {
      const status = {
        stage: LicenceStage.PROCESSING_CA,
        postApproval: false,
        tasks: {
          curfewAddress: TaskState.UNSTARTED,
          bassOffer: TaskState.DONE,
          bassAreaCheck: TaskState.UNSTARTED,
        },
        decisions: {
          bassReferralNeeded: true,
        },
      }

      const allowed = getAllowedTransition(status)

      expect(allowed).toBe('caToRo')
    })

    test('Should be any transitions when in the PROCESSING_CA for BASS when BASS area check not done, but approved premises required', () => {
      const status = {
        stage: LicenceStage.PROCESSING_CA,
        postApproval: false,
        tasks: {
          curfewAddress: TaskState.UNSTARTED,
          bassOffer: TaskState.DONE,
          bassAreaCheck: TaskState.UNSTARTED,
        },
        decisions: {
          bassReferralNeeded: true,
          approvedPremisesRequired: true,
        },
      }

      const allowed = getAllowedTransition(status)

      expect(allowed).toBeNull()
    })

    test('Should be any transitions when in the MODIFIED stage for BASS when BASS area check not done, but approved premises required', () => {
      const status = {
        stage: LicenceStage.MODIFIED,
        postApproval: true,
        tasks: {
          curfewAddress: TaskState.UNSTARTED,
          bassOffer: TaskState.DONE,
          bassAreaCheck: TaskState.UNSTARTED,
        },
        decisions: {
          bassReferralNeeded: true,
          approvedPremisesRequired: true,
        },
      }

      const allowed = getAllowedTransition(status)

      expect(allowed).toBeNull()
    })

    test('should allow CA to RO when address review has not been started', () => {
      const status = {
        stage: LicenceStage.PROCESSING_CA,
        postApproval: false,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.DONE,
          optOut: TaskState.DONE,
          curfewAddress: TaskState.DONE,
          curfewAddressReview: TaskState.UNSTARTED,
        },
        decisions: {
          postponed: null,
          curfewAddressApproved: true,
          excluded: null,
          finalChecksRefused: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToRo')
    })

    test('should allow CA to RO when address has been withdrawn and a new address added in Post-decision', () => {
      const status = {
        stage: LicenceStage.MODIFIED,
        postApproval: false,
        tasks: {
          curfewAddressReview: TaskState.UNSTARTED,
        },
        decisions: {},
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToRo')
    })
  })

  describe('CA to DM', () => {
    test('should allow CA to DM in the PROCESSING_CA stage when all CA tasks done and decisions OK', () => {
      const status = {
        stage: LicenceStage.PROCESSING_CA,
        postApproval: false,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.DONE,
          optOut: TaskState.DONE,
          bassReferral: TaskState.DONE,
          curfewAddress: TaskState.DONE,
          finalChecks: TaskState.DONE,
        },
        decisions: {
          postponed: null,
          curfewAddressApproved: true,
          excluded: null,
        },
      }

      const allowed = getAllowedTransition(status)

      expect(allowed).toBe('caToDm')
    })

    test('should not allow CA to DM in the PROCESSING_CA when any CA tasks not done and decisions not OK', () => {
      const status = {
        stage: LicenceStage.PROCESSING_CA,
        postApproval: false,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.UNSTARTED,
          optOut: TaskState.DONE,
          bassReferral: TaskState.DONE,
        },
        decisions: {
          postponed: null,
          curfewAddressApproved: true,
          excluded: true,
        },
      }

      const allowed = getAllowedTransition(status)

      expect(allowed).toBe(null)
    })

    test('should allow CA to DM in the PROCESSING_CA for BASS when only BASS offer and final checks tasks done', () => {
      const status = {
        stage: LicenceStage.PROCESSING_CA,
        postApproval: false,
        tasks: {
          curfewAddress: TaskState.UNSTARTED,
          bassOffer: TaskState.DONE,
          finalChecks: TaskState.DONE,
        },
        decisions: {
          bassReferralNeeded: true,
        },
      }

      const allowed = getAllowedTransition(status)

      expect(allowed).toBe('caToDm')
    })

    test('should allow CA to DM refusal when eligible and insufficient time', () => {
      const status = {
        stage: LicenceStage.ELIGIBILITY,
        postApproval: false,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.DONE,
          optOut: TaskState.DONE,
          bassReferral: TaskState.DONE,
          curfewAddress: TaskState.DONE,
          finalChecks: TaskState.DONE,
        },
        decisions: {
          insufficientTimeStop: true,
          eligible: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToDmRefusal')
    })

    test('should allow CA to DM refusal when ineligble but insufficientTimeStop', () => {
      const status = {
        stage: LicenceStage.ELIGIBILITY,
        postApproval: false,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.DONE,
          optOut: TaskState.DONE,
          bassReferral: TaskState.DONE,
          curfewAddress: TaskState.DONE,
          finalChecks: TaskState.DONE,
        },
        decisions: {
          insufficientTimeStop: true,
          eligible: null,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToDmRefusal')
    })

    test('should not allow CA to DM refusal if ineligible without', () => {
      const status = {
        stage: LicenceStage.ELIGIBILITY,
        postApproval: false,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.DONE,
          optOut: TaskState.DONE,
          bassReferral: TaskState.DONE,
          curfewAddress: TaskState.DONE,
          finalChecks: TaskState.DONE,
        },
        decisions: {
          eligible: null,
          curfewAddressApproved: false,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe(null)
    })

    test('should not allow CA to DM refusal if already refused by ca', () => {
      const status = {
        stage: LicenceStage.PROCESSING_CA,
        postApproval: false,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.DONE,
          optOut: TaskState.DONE,
          bassReferral: TaskState.DONE,
          curfewAddress: TaskState.DONE,
          finalChecks: TaskState.DONE,
        },
        decisions: {
          curfewAddressApproved: false,
          eligible: true,
          finalChecksRefused: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe(null)
    })

    test('should allow CA to DM refusal if curfew address is rejected', () => {
      const status = {
        stage: LicenceStage.ELIGIBILITY,
        postApproval: true,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.DONE,
          optOut: TaskState.DONE,
          bassReferral: TaskState.DONE,
          curfewAddress: TaskState.DONE,
          finalChecks: TaskState.DONE,
        },
        decisions: {
          eligible: true,
          curfewAddressRejected: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToDmRefusal')
    })

    test('should allow CA to DM refusal if BASS area is rejected - POST_APPROVAL', () => {
      const status = {
        stage: LicenceStage.MODIFIED,
        postApproval: true,
        tasks: {},
        decisions: {
          eligible: true,
          bassReferralNeeded: true,
          bassAreaNotSuitable: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToDmRefusal')
    })

    test('should allow CA to DM refusal if BASS outcome is Unsuitable - POST_APPROVAL', () => {
      const status = {
        stage: LicenceStage.MODIFIED,
        postApproval: true,
        tasks: {},
        decisions: {
          eligible: true,
          bassReferralNeeded: true,
          bassAreaSuitable: true,
          bassAccepted: 'Unsuitable' as const,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToDmRefusal')
    })

    test('should allow CA to DM refusal if BASS outcome is Unavailable - POST_APPROVAL', () => {
      const status = {
        stage: LicenceStage.MODIFIED,
        postApproval: true,
        tasks: {},
        decisions: {
          eligible: true,
          bassReferralNeeded: true,
          bassAreaSuitable: true,
          bassAccepted: 'Unavailable' as const,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToDmRefusal')
    })

    test('should allow CA to DM refusal if address is not rejected - POST_APPROVAL', () => {
      const status = {
        stage: LicenceStage.MODIFIED,
        postApproval: true,
        tasks: {},
        decisions: {
          curfewAddressRejected: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToDmRefusal')
    })

    test('should allow CA to DM refusal if BASS is withdrawn', () => {
      const status = {
        stage: LicenceStage.PROCESSING_CA,
        postApproval: true,
        tasks: {},
        decisions: {
          eligible: true,
          bassReferralNeeded: true,
          bassWithdrawn: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToDmRefusal')
    })

    test('should not allow CA to DM when HDC refused', () => {
      const status = {
        stage: LicenceStage.PROCESSING_CA,
        postApproval: true,
        tasks: {
          exclusion: TaskState.DONE,
          crdTime: TaskState.DONE,
          suitability: TaskState.DONE,
          optOut: TaskState.DONE,
          curfewAddress: TaskState.DONE,
          finalChecks: TaskState.DONE,
        },
        decisions: {
          postponed: null,
          curfewAddressApproved: true,
          excluded: null,
          finalChecksRefused: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe(null)
    })

    test('should allow CA to DM refusal when address has been withdrawn', () => {
      const status = {
        stage: LicenceStage.PROCESSING_CA,
        postApproval: true,
        tasks: {},
        decisions: {
          addressWithdrawn: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToDmRefusal')
    })

    test('should allow CA to DM refusal when address has been withdrawn (but no new address added) in Post-decision', () => {
      const status = {
        stage: LicenceStage.MODIFIED,
        postApproval: true,
        tasks: {},
        decisions: {
          addressWithdrawn: true,
        },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToDmRefusal')
    })

    test('should allow CA to DM when approved premises', () => {
      const status = {
        stage: LicenceStage.PROCESSING_CA,
        postApproval: true,
        tasks: { finalChecks: TaskState.DONE, approvedPremisesAddress: TaskState.DONE },
        decisions: { approvedPremisesRequired: true },
      }

      const allowed = getAllowedTransition(status)
      expect(allowed).toBe('caToDm')
    })
  })
})
