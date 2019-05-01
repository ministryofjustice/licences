const {
  getLabel,
  getRoAction,
  getCaPostApprovalAction,
  getCaProcessingAction,
  getDmAction,
} = require('../../../../../server/routes/viewModels/taskLists/tasks/curfewAddress')

describe('curfew address task', () => {
  describe('getLabel', () => {
    it('should return Opted out if optedOut = true', () => {
      expect(
        getLabel({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).to.equal('Opted out')
    })

    it('should return Address withdrawn if addressWithdrawn = true', () => {
      expect(
        getLabel({
          decisions: { addressWithdrawn: true },
          tasks: {},
        })
      ).to.equal('Address withdrawn')
    })

    it('should return Address review failed if addressReviewFailed = true', () => {
      expect(
        getLabel({
          decisions: { addressReviewFailed: true },
          tasks: {},
        })
      ).to.equal('Address rejected')
    })

    it('should return Address checked if curfewAddressReview && riskManagement === DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { curfewAddressReview: 'DONE', riskManagement: 'DONE' },
        })
      ).to.equal('Address checked')
    })

    it('should return Approved premises label if approved premises required and done', () => {
      expect(
        getLabel({
          decisions: { approvedPremisesRequired: true },
          tasks: { approvedPremisesAddress: 'DONE' },
        })
      ).to.equal('Approved premises required')
    })

    it('should return incomplete label if approved premises required but not done', () => {
      expect(
        getLabel({
          decisions: { approvedPremisesRequired: true },
          tasks: { approvedPremisesAddress: 'STARTED' },
        })
      ).to.equal('Not completed')
    })

    it('should return Not completed if none of above', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: {},
        })
      ).to.equal('Not completed')
    })
  })

  describe('getRoAction', () => {
    it('should link to approvedPremises if curfewAddressRejected', () => {
      expect(
        getRoAction({
          decisions: { curfewAddressRejected: true },
          tasks: {},
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/curfew/approvedPremises/',
        type: 'link',
      })
    })

    it('should show btn to approvedPremises if curfewAddressReview: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { curfewAddressReview: 'UNSTARTED' },
        })
      ).to.eql({
        text: 'Start now',
        href: '/hdc/curfew/approvedPremises/',
        type: 'btn',
      })
    })

    it('should show change link to approvedPremises if curfewAddressReview: DONE', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { curfewAddressReview: 'DONE' },
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/curfew/approvedPremises/',
        type: 'link',
      })
    })

    it('should show continue btn to approvedPremises if curfewAddressReview: !DONE || UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { curfewAddressReview: 'SOMETHING' },
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/curfew/approvedPremises/',
        type: 'btn',
      })
    })
  })

  describe('getCaPostApprovalAction', () => {
    it('should btn to consentWithdrawn page if addressWithdrawn', () => {
      expect(
        getCaPostApprovalAction({
          decisions: { addressWithdrawn: true },
          tasks: {},
        })
      ).to.eql({
        text: 'View/Edit',
        href: '/hdc/curfew/consentWithdrawn/',
        type: 'btn-secondary',
      })
    })

    it('should btn to review page if addressWithdrawn !== true', () => {
      expect(
        getCaPostApprovalAction({
          decisions: {},
          tasks: {},
        })
      ).to.eql({
        text: 'View/Edit',
        href: '/hdc/review/address/',
        type: 'btn-secondary',
      })
    })

    it('should btn to approved premises choice page if approvedPremisesRequired', () => {
      expect(
        getCaPostApprovalAction({
          decisions: { approvedPremisesRequired: true },
          tasks: {},
        })
      ).to.eql({
        text: 'View/Edit',
        href: '/hdc/curfew/approvedPremisesChoice/',
        type: 'btn-secondary',
      })
    })
  })

  describe('getCaProcessingAction', () => {
    it('should btn to 3 way choice if opted out', () => {
      expect(
        getCaProcessingAction({
          decisions: { optedOut: true },
          tasks: { curfewAddress: 'UNSTARTED' },
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
      })
    })

    it('should link to 3 way choice if opted out', () => {
      expect(
        getCaProcessingAction({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
      })
    })

    it('should btn to 3 way choice if curfewAddress is UNSTARTED', () => {
      expect(
        getCaProcessingAction({
          decisions: { optedOut: false },
          tasks: { curfewAddress: 'UNSTARTED' },
        })
      ).to.eql({
        text: 'Start now',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
      })
    })

    it('should change link to review path if curfewAddress !== UNSTARTED and !optedOut', () => {
      expect(
        getCaProcessingAction({
          decisions: { optedOut: false },
          tasks: { curfewAddress: 'SOMETHING' },
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/review/address/',
        type: 'link',
      })
    })
  })

  describe('getDmAction', () => {
    it('should link to approvedPremisesAddress if approved premises required', () => {
      expect(
        getDmAction({
          decisions: { approvedPremisesRequired: true },
          tasks: {},
        })
      ).to.eql({
        text: 'View',
        href: '/hdc/review/approvedPremisesAddress/',
        type: 'btn-secondary',
      })
    })

    it('should link to address if approved premises not required', () => {
      expect(
        getDmAction({
          decisions: { approvedPremisesRequired: false },
          tasks: {},
        })
      ).to.eql({
        text: 'View',
        href: '/hdc/review/address/',
        type: 'btn-secondary',
      })
    })
  })
})
