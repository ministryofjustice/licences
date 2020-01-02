const {
  getLabel,
  getRoAction,
  getCaPostApprovalAction,
  getCaProcessingAction,
  getDmAction,
} = require('../../../../../server/routes/viewModels/taskLists/tasks/curfewAddress')

describe('curfew address task', () => {
  describe('getLabel', () => {
    test('should return Opted out if optedOut = true', () => {
      expect(
        getLabel({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).toBe('Opted out')
    })

    test('should return Address withdrawn if addressWithdrawn = true', () => {
      expect(
        getLabel({
          decisions: { addressWithdrawn: true },
          tasks: {},
        })
      ).toBe('Address withdrawn')
    })

    test('should return Address review failed if addressReviewFailed = true', () => {
      expect(
        getLabel({
          decisions: { addressReviewFailed: true },
          tasks: {},
        })
      ).toBe('Address rejected')
    })

    test('should return Address checked if curfewAddressReview && riskManagement === DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { curfewAddressReview: 'DONE', riskManagement: 'DONE' },
        })
      ).toBe('Address checked')
    })

    test('should return Approved premises label if approved premises required and done', () => {
      expect(
        getLabel({
          decisions: { approvedPremisesRequired: true },
          tasks: { approvedPremisesAddress: 'DONE' },
        })
      ).toBe('Approved premises required')
    })

    test('should return incomplete label if approved premises required but not done', () => {
      expect(
        getLabel({
          decisions: { approvedPremisesRequired: true },
          tasks: { approvedPremisesAddress: 'STARTED' },
        })
      ).toBe('Not completed')
    })

    test('should return Not completed if none of above', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: {},
        })
      ).toBe('Not completed')
    })
  })

  describe('getRoAction', () => {
    test('should link to approvedPremises if curfewAddressRejected', () => {
      expect(
        getRoAction({
          decisions: { curfewAddressRejected: true },
          tasks: {},
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/curfew/approvedPremises/',
        type: 'link',
      })
    })

    test('should show btn to approvedPremises if curfewAddressReview: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { curfewAddressReview: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/curfew/approvedPremises/',
        type: 'btn',
      })
    })

    test('should show change link to approvedPremises if curfewAddressReview: DONE', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { curfewAddressReview: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/curfew/approvedPremises/',
        type: 'link',
      })
    })

    test('should show continue btn to approvedPremises if curfewAddressReview: !DONE || UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { curfewAddressReview: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/curfew/approvedPremises/',
        type: 'btn',
      })
    })
  })

  describe('getCaPostApprovalAction', () => {
    test('should btn to consentWithdrawn page if addressWithdrawn', () => {
      expect(
        getCaPostApprovalAction({
          decisions: { addressWithdrawn: true },
          tasks: {},
        })
      ).toEqual({
        text: 'View/Edit',
        href: '/hdc/curfew/consentWithdrawn/',
        type: 'btn-secondary',
      })
    })

    test('should btn to review page if addressWithdrawn !== true', () => {
      expect(
        getCaPostApprovalAction({
          decisions: {},
          tasks: {},
        })
      ).toEqual({
        text: 'View/Edit',
        href: '/hdc/review/address/',
        type: 'btn-secondary',
      })
    })

    test('should btn to approved premises choice page if approvedPremisesRequired', () => {
      expect(
        getCaPostApprovalAction({
          decisions: { approvedPremisesRequired: true },
          tasks: {},
        })
      ).toEqual({
        text: 'View/Edit',
        href: '/hdc/curfew/approvedPremisesChoice/',
        type: 'btn-secondary',
      })
    })

    test('should link to 3 way choice if opted out', () => {
      expect(
        getCaPostApprovalAction({
          decisions: { optedOut: true },
          tasks: { curfewAddress: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
      })
    })
  })

  describe('getCaProcessingAction', () => {
    test('should link to 3 way choice if opted out', () => {
      expect(
        getCaProcessingAction({
          decisions: { optedOut: true },
          tasks: { curfewAddress: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
      })
    })

    test('should link to 3 way choice if opted out', () => {
      expect(
        getCaProcessingAction({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
      })
    })

    test('should btn to 3 way choice if curfewAddress is UNSTARTED', () => {
      expect(
        getCaProcessingAction({
          decisions: { optedOut: false },
          tasks: { curfewAddress: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
      })
    })

    test('should change link to review path if curfewAddress !== UNSTARTED and !optedOut', () => {
      expect(
        getCaProcessingAction({
          decisions: { optedOut: false },
          tasks: { curfewAddress: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/review/address/',
        type: 'link',
      })
    })
  })

  describe('getDmAction', () => {
    test('should link to approvedPremisesAddress if approved premises required', () => {
      expect(
        getDmAction({
          decisions: { approvedPremisesRequired: true },
          tasks: {},
        })
      ).toEqual({
        text: 'View',
        href: '/hdc/review/approvedPremisesAddress/',
        type: 'btn-secondary',
      })
    })

    test('should link to address if approved premises not required', () => {
      expect(
        getDmAction({
          decisions: { approvedPremisesRequired: false },
          tasks: {},
        })
      ).toEqual({
        text: 'View',
        href: '/hdc/review/address/',
        type: 'btn-secondary',
      })
    })
  })
})
