const { getReviewSections } = require('../../../server/routes/viewModels/reviewModels')

describe('Review page models', () => {
  describe('getReviewSections', () => {
    it('should be empty if no decisions', () => {
      expect(getReviewSections({})).to.eql({})
    })

    it('should activate bassArea on bassReferralNeeded', () => {
      expect(getReviewSections({ decisions: { bassReferralNeeded: true } }).bassArea).to.eql(true)
      expect(getReviewSections({ decisions: { bassReferralNeeded: false } }).bassArea).to.eql(false)
      expect(getReviewSections({ decisions: { bassReferralNeeded: undefined } }).bassArea).to.eql(false)
    })

    it('should activate approvedPremisesAddress on approvedPremisesRequired', () => {
      expect(getReviewSections({ decisions: { approvedPremisesRequired: true } }).approvedPremisesAddress).to.eql(true)
      expect(getReviewSections({ decisions: { approvedPremisesRequired: false } }).approvedPremisesAddress).to.eql(
        false
      )
      expect(getReviewSections({ decisions: { approvedPremisesRequired: undefined } }).approvedPremisesAddress).to.eql(
        false
      )
    })

    it('should activate curfewAddress when not bass or ap', () => {
      expect(
        getReviewSections({ decisions: { bassReferralNeeded: false, approvedPremisesRequired: false } }).curfewAddress
      ).to.eql(true)
      expect(
        getReviewSections({ decisions: { bassReferralNeeded: true, approvedPremisesRequired: false } }).curfewAddress
      ).to.eql(false)
      expect(
        getReviewSections({ decisions: { bassReferralNeeded: undefined, approvedPremisesRequired: undefined } })
          .curfewAddress
      ).to.eql(true)
    })

    it('should show riskManagement when address risk and not ap', () => {
      expect(
        getReviewSections({ decisions: { addressUnsuitable: true, approvedPremisesRequired: false } }).riskManagement
      ).to.eql(true)
    })

    it('should show riskManagement when address not rejected and not ap', () => {
      expect(
        getReviewSections({ decisions: { curfewAddressRejected: false, approvedPremisesRequired: false } })
          .riskManagement
      ).to.eql(true)
    })

    it('should not show riskManagement if ap', () => {
      expect(
        getReviewSections({ decisions: { addressUnsuitable: true, approvedPremisesRequired: true } }).riskManagement
      ).to.eql(false)
      expect(
        getReviewSections({ decisions: { curfewAddressRejected: true, approvedPremisesRequired: true } }).riskManagement
      ).to.eql(false)
    })

    it('should not show main tasks when address rejected and not ap', () => {
      const { victimLiaison, curfewHours, additionalConditions, reportingInstructions } = getReviewSections({
        decisions: { curfewAddressRejected: true, approvedPremisesRequired: false },
      })
      expect(victimLiaison).to.eql(false)
      expect(curfewHours).to.eql(false)
      expect(additionalConditions).to.eql(false)
      expect(reportingInstructions).to.eql(false)
    })

    it('should not show main tasks when bass rejected and not ap', () => {
      const { victimLiaison, curfewHours, additionalConditions, reportingInstructions } = getReviewSections({
        decisions: { bassAreaNotSuitable: true, approvedPremisesRequired: false },
      })
      expect(victimLiaison).to.eql(false)
      expect(curfewHours).to.eql(false)
      expect(additionalConditions).to.eql(false)
      expect(reportingInstructions).to.eql(false)
    })

    it('should show main tasks if address rejected when ap', () => {
      const { victimLiaison, curfewHours, additionalConditions, reportingInstructions } = getReviewSections({
        decisions: { curfewAddressRejected: true, approvedPremisesRequired: true },
      })
      expect(victimLiaison).to.eql(true)
      expect(curfewHours).to.eql(true)
      expect(additionalConditions).to.eql(true)
      expect(reportingInstructions).to.eql(true)
    })

    it('should show main tasks if bass rejected when ap', () => {
      const { victimLiaison, curfewHours, additionalConditions, reportingInstructions } = getReviewSections({
        decisions: { bassAreaNotSuitable: true, approvedPremisesRequired: true },
      })
      expect(victimLiaison).to.eql(true)
      expect(curfewHours).to.eql(true)
      expect(additionalConditions).to.eql(true)
      expect(reportingInstructions).to.eql(true)
    })

    it('should show required sections for curfew address', () => {
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
      expect(getReviewSections({ decisions })).to.eql(expected)
    })

    it('should show required sections for ap', () => {
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
      expect(getReviewSections({ decisions })).to.eql(expected)
    })

    it('should show required sections for bass address', () => {
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
      expect(getReviewSections({ decisions })).to.eql(expected)
    })
  })
})
