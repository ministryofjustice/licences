const { getReviewSections } = require('../../../server/routes/viewModels/reviewModels')

describe('Review page models', () => {
  describe('getReviewSections', () => {
    test('should be empty if no decisions', () => {
      expect(getReviewSections({ decisions: null })).toEqual({})
    })

    test('should activate bassArea on bassReferralNeeded', () => {
      expect(getReviewSections({ decisions: { bassReferralNeeded: true } }).bassArea).toBe(true)
      expect(getReviewSections({ decisions: { bassReferralNeeded: false } }).bassArea).toBe(false)
      expect(getReviewSections({ decisions: { bassReferralNeeded: undefined } }).bassArea).toBe(false)
    })

    test('should activate approvedPremisesAddress on approvedPremisesRequired', () => {
      expect(getReviewSections({ decisions: { approvedPremisesRequired: true } }).approvedPremisesAddress).toBe(true)
      expect(getReviewSections({ decisions: { approvedPremisesRequired: false } }).approvedPremisesAddress).toBe(false)
      expect(getReviewSections({ decisions: { approvedPremisesRequired: undefined } }).approvedPremisesAddress).toBe(
        false
      )
    })

    test('should activate curfewAddress when not bass or ap', () => {
      expect(
        getReviewSections({ decisions: { bassReferralNeeded: false, approvedPremisesRequired: false } }).curfewAddress
      ).toBe(true)
      expect(
        getReviewSections({ decisions: { bassReferralNeeded: true, approvedPremisesRequired: false } }).curfewAddress
      ).toBe(false)
      expect(
        getReviewSections({ decisions: { bassReferralNeeded: undefined, approvedPremisesRequired: undefined } })
          .curfewAddress
      ).toBe(true)
    })

    test('should show riskManagement when address risk and not ap', () => {
      expect(
        getReviewSections({ decisions: { addressUnsuitable: true, approvedPremisesRequired: false } }).riskManagement
      ).toBe(true)
    })

    test('should show riskManagement when address not rejected and not ap', () => {
      expect(
        getReviewSections({ decisions: { curfewAddressRejected: false, approvedPremisesRequired: false } })
          .riskManagement
      ).toBe(true)
    })

    test('should not show riskManagement if ap', () => {
      expect(
        getReviewSections({ decisions: { addressUnsuitable: true, approvedPremisesRequired: true } }).riskManagement
      ).toBe(false)
      expect(
        getReviewSections({ decisions: { curfewAddressRejected: true, approvedPremisesRequired: true } }).riskManagement
      ).toBe(false)
    })

    test('should not show main tasks when address rejected and not ap', () => {
      const { victimLiaison, curfewHours, additionalConditions, reportingInstructions } = getReviewSections({
        decisions: { curfewAddressRejected: true, approvedPremisesRequired: false },
      })
      expect(victimLiaison).toBe(false)
      expect(curfewHours).toBe(false)
      expect(additionalConditions).toBe(false)
      expect(reportingInstructions).toBe(false)
    })

    test('should not show main tasks when bass rejected and not ap', () => {
      const { victimLiaison, curfewHours, additionalConditions, reportingInstructions } = getReviewSections({
        decisions: { bassAreaNotSuitable: true, approvedPremisesRequired: false },
      })
      expect(victimLiaison).toBe(false)
      expect(curfewHours).toBe(false)
      expect(additionalConditions).toBe(false)
      expect(reportingInstructions).toBe(false)
    })

    test('should show main tasks if address rejected when ap', () => {
      const { victimLiaison, curfewHours, additionalConditions, reportingInstructions } = getReviewSections({
        decisions: { curfewAddressRejected: true, approvedPremisesRequired: true },
      })
      expect(victimLiaison).toBe(true)
      expect(curfewHours).toBe(true)
      expect(additionalConditions).toBe(true)
      expect(reportingInstructions).toBe(true)
    })

    test('should show main tasks if bass rejected when ap', () => {
      const { victimLiaison, curfewHours, additionalConditions, reportingInstructions } = getReviewSections({
        decisions: { bassAreaNotSuitable: true, approvedPremisesRequired: true },
      })
      expect(victimLiaison).toBe(true)
      expect(curfewHours).toBe(true)
      expect(additionalConditions).toBe(true)
      expect(reportingInstructions).toBe(true)
    })

    test('should show required sections for curfew address', () => {
      const decisions = {
        bassReferralNeeded: false,
        bassAreaNotSuitable: false,
        approvedPremisesRequired: false,
        curfewAddressRejected: false,
        addressUnsuitable: false,
      }
      const expected = {
        approvedPremisesAddress: false,
        bassArea: false,
        curfewAddress: true,
        riskManagement: true,
        additionalConditions: true,
        curfewHours: true,
        reportingInstructions: true,
        victimLiaison: true,
      }
      expect(getReviewSections({ decisions })).toEqual(expected)
    })

    test('should show required sections for ap', () => {
      const decisions = {
        bassReferralNeeded: false,
        bassAreaNotSuitable: false,
        approvedPremisesRequired: true,
        curfewAddressRejected: false,
        addressUnsuitable: false,
      }
      const expected = {
        approvedPremisesAddress: true,
        bassArea: false,
        curfewAddress: false,
        riskManagement: false,
        additionalConditions: true,
        curfewHours: true,
        reportingInstructions: true,
        victimLiaison: true,
      }
      expect(getReviewSections({ decisions })).toEqual(expected)
    })

    test('should show required sections for bass address', () => {
      const decisions = {
        bassReferralNeeded: true,
        bassAreaNotSuitable: false,
        approvedPremisesRequired: false,
        curfewAddressRejected: false,
        addressUnsuitable: false,
      }
      const expected = {
        approvedPremisesAddress: false,
        bassArea: true,
        curfewAddress: false,
        riskManagement: true,
        additionalConditions: true,
        curfewHours: true,
        reportingInstructions: true,
        victimLiaison: true,
      }
      expect(getReviewSections({ decisions })).toEqual(expected)
    })
  })
})
