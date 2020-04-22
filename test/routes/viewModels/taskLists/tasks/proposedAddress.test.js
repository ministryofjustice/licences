const proposedAddress = require('../../../../../server/routes/viewModels/taskLists/tasks/proposedAddress')

describe('proposed address task', () => {
  describe('getLabel', () => {
    test('should return Opted out if optedOut = true', () => {
      expect(
        proposedAddress.ro({
          decisions: { optedOut: true },
          tasks: {},
        }).label
      ).toBe('Opted out')
    })

    test('should return Address withdrawn if addressWithdrawn = true', () => {
      expect(
        proposedAddress.ro({
          decisions: { addressWithdrawn: true },
          tasks: {},
        }).label
      ).toBe('Address withdrawn')
    })

    test('should return Address review failed if addressReviewFailed = true', () => {
      expect(
        proposedAddress.ro({
          decisions: { addressReviewFailed: true },
          tasks: {},
        }).label
      ).toBe('Address rejected')
    })

    test('should return Address checked if curfewAddressReview && riskManagement === DONE', () => {
      expect(
        proposedAddress.ro({
          decisions: {},
          tasks: { curfewAddressReview: 'DONE', riskManagement: 'DONE' },
        }).label
      ).toBe('Address checked')
    })

    test('should return Approved premises label if approved premises required and done', () => {
      expect(
        proposedAddress.ro({
          decisions: { approvedPremisesRequired: true },
          tasks: { approvedPremisesAddress: 'DONE' },
        }).label
      ).toBe('Approved premises required')
    })

    test('should return incomplete label if approved premises required but not done', () => {
      expect(
        proposedAddress.ro({
          decisions: { approvedPremisesRequired: true },
          tasks: { approvedPremisesAddress: 'STARTED' },
        }).label
      ).toBe('Not completed')
    })

    test('should return Not completed if none of above', () => {
      expect(
        proposedAddress.ro({
          decisions: {},
          tasks: {},
        }).label
      ).toBe('Not completed')
    })
  })

  describe('getRoAction', () => {
    test('should link to approvedPremises if curfewAddressRejected', () => {
      expect(
        proposedAddress.ro({
          decisions: { curfewAddressRejected: true },
          tasks: {},
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/curfew/approvedPremises/',
        type: 'link',
      })
    })

    test('should show btn to approvedPremises if curfewAddressReview: UNSTARTED', () => {
      expect(
        proposedAddress.ro({
          decisions: {},
          tasks: { curfewAddressReview: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Start now',
        href: '/hdc/curfew/approvedPremises/',
        type: 'btn',
      })
    })

    test('should show change link to approvedPremises if curfewAddressReview: DONE', () => {
      expect(
        proposedAddress.ro({
          decisions: {},
          tasks: { curfewAddressReview: 'DONE' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/curfew/approvedPremises/',
        type: 'link',
      })
    })

    test('should show continue btn to approvedPremises if curfewAddressReview: !DONE || UNSTARTED', () => {
      expect(
        proposedAddress.ro({
          decisions: {},
          tasks: { curfewAddressReview: 'SOMETHING' },
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/curfew/approvedPremises/',
        type: 'btn',
      })
    })
  })

  describe('Ca PostApproval Action', () => {
    test('should btn to consentWithdrawn page if addressWithdrawn', () => {
      expect(
        proposedAddress.ca.postApproval({
          decisions: { addressWithdrawn: true },
          tasks: {},
        }).action
      ).toEqual({
        text: 'View/Edit',
        href: '/hdc/curfew/consentWithdrawn/',
        type: 'btn-secondary',
        dataQa: 'proposed-curfew-address',
      })
    })

    test('should btn to review page if addressWithdrawn !== true', () => {
      expect(
        proposedAddress.ca.postApproval({
          decisions: {},
          tasks: {},
        }).action
      ).toEqual({
        text: 'View/Edit',
        href: '/hdc/review/address/',
        type: 'btn-secondary',
        dataQa: 'proposed-curfew-address',
      })
    })

    test('should btn to approved premises choice page if approvedPremisesRequired', () => {
      expect(
        proposedAddress.ca.postApproval({
          decisions: { approvedPremisesRequired: true },
          tasks: {},
        }).action
      ).toEqual({
        text: 'View/Edit',
        href: '/hdc/curfew/approvedPremisesChoice/',
        type: 'btn-secondary',
        dataQa: 'proposed-curfew-address',
      })
    })

    test('should link to 3 way choice if opted out', () => {
      expect(
        proposedAddress.ca.postApproval({
          decisions: { optedOut: true },
          tasks: { curfewAddress: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
        dataQa: 'proposed-curfew-address',
      })
    })
  })

  describe('Ca Processing Action', () => {
    test('should link to 3 way choice if opted out', () => {
      expect(
        proposedAddress.ca.processing({
          decisions: { optedOut: true },
          tasks: { curfewAddress: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
        dataQa: 'proposed-curfew-address',
      })
    })

    test('should link to 3 way choice if opted out', () => {
      expect(
        proposedAddress.ca.processing({
          decisions: { optedOut: true },
          tasks: {},
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
        dataQa: 'proposed-curfew-address',
      })
    })

    test('should btn to 3 way choice if curfewAddress is UNSTARTED', () => {
      expect(
        proposedAddress.ca.processing({
          decisions: { optedOut: false },
          tasks: { curfewAddress: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Start now',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
      })
    })

    test('should change link to review path if curfewAddress !== UNSTARTED and !optedOut', () => {
      expect(
        proposedAddress.ca.processing({
          decisions: { optedOut: false },
          tasks: { curfewAddress: 'SOMETHING' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/review/address/',
        type: 'link',
        dataQa: 'proposed-curfew-address',
      })
    })
  })

  describe('Dm Action', () => {
    test('should link to approvedPremisesAddress if approved premises required', () => {
      expect(
        proposedAddress.dm.view({
          decisions: { approvedPremisesRequired: true },
          tasks: {},
        }).action
      ).toEqual({
        text: 'View',
        href: '/hdc/review/approvedPremisesAddress/',
        type: 'btn-secondary',
      })
    })

    test('should link to address if approved premises not required', () => {
      expect(
        proposedAddress.dm.view({
          decisions: { approvedPremisesRequired: false },
          tasks: {},
        }).action
      ).toEqual({
        text: 'View',
        href: '/hdc/review/address/',
        type: 'btn-secondary',
      })
    })
  })
})
