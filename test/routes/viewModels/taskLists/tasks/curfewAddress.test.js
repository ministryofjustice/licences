const curfewAddress = require('../../../../../server/routes/viewModels/taskLists/tasks/curfewAddress')

describe('curfew address task', () => {
  describe('getLabel', () => {
    test('should return Offender has opted out of HDC if optedOut = true', () => {
      expect(
        curfewAddress({
          decisions: { optedOut: true },
          tasks: {},
        }).label
      ).toBe('Offender has opted out of HDC')
    })

    test('should return BASS area rejected if bassReferralNeeded and bassAreaNotSuitable', () => {
      expect(
        curfewAddress({
          decisions: { optedOut: false, bassReferralNeeded: true, bassAreaNotSuitable: true },
          tasks: {},
        }).label
      ).toBe('ALERT||BASS area rejected')
    })

    test('should return Completed if bassReferralNeeded && bassRequest = DONE', () => {
      expect(
        curfewAddress({
          decisions: { optedOut: false, bassReferralNeeded: true, bassAreaNotSuitable: false },
          tasks: { bassRequest: 'DONE' },
        }).label
      ).toBe('Completed')
    })

    test('should return Not completed if bassReferralNeeded && bassRequest not DONE', () => {
      expect(
        curfewAddress({
          decisions: { optedOut: false, bassReferralNeeded: true, bassAreaNotSuitable: false },
          tasks: { bassRequest: 'SOMETHING' },
        }).label
      ).toBe('Not completed')
    })

    test('should return Address rejected curfewAddressRejected', () => {
      expect(
        curfewAddress({
          decisions: { optedOut: false, bassReferralNeeded: false, curfewAddressRejected: true },
          tasks: {},
        }).label
      ).toBe('ALERT||Address rejected')
    })

    test('should return Completed if curfewAddress: DONE', () => {
      expect(
        curfewAddress({
          decisions: { optedOut: false, bassReferralNeeded: false, curfewAddressRejected: false },
          tasks: { curfewAddress: 'DONE' },
        }).label
      ).toBe('Completed')
    })

    test('should return Not completed if curfewAddress not DONE', () => {
      expect(
        curfewAddress({
          decisions: { optedOut: false, bassReferralNeeded: false, curfewAddressRejected: false },
          tasks: { curfewAddress: 'SOMETHING' },
        }).label
      ).toBe('Not completed')
    })
  })

  describe('action', () => {
    test('should show btn to proposedAddress/rejected/ if curfewAddressRejected && curfewAddress: UNSTARTED', () => {
      expect(
        curfewAddress({
          decisions: { curfewAddressRejected: true },
          tasks: { curfewAddress: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Start now',
        href: '/hdc/proposedAddress/rejected/',
        type: 'btn',
      })
    })

    test('should show change link to proposedAddress/rejected/ if curfewAddressRejected && curfewAddress: DONE', () => {
      expect(
        curfewAddress({
          decisions: { curfewAddressRejected: true },
          tasks: { curfewAddress: 'DONE' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/proposedAddress/rejected/',
        type: 'link',
        dataQa: 'curfew-address',
      })
    })

    test('should show continue btn to proposedAddress/rejected/ if curfewAddressRejected && curfewAddress: !DONE || UNSTARTED', () => {
      expect(
        curfewAddress({
          decisions: { curfewAddressRejected: true },
          tasks: { curfewAddress: 'SOMETHING' },
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/proposedAddress/rejected/',
        type: 'btn',
      })
    })

    test('should show btn to bassReferral/rejected/ if bassAreaNotSuitable && curfewAddress: UNSTARTED', () => {
      expect(
        curfewAddress({
          decisions: { bassAreaNotSuitable: true },
          tasks: { curfewAddress: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Start now',
        href: '/hdc/bassReferral/rejected/',
        type: 'btn',
      })
    })

    test('should show change link to bassReferral/rejected if bassAreaNotSuitable && curfewAddress: DONE', () => {
      expect(
        curfewAddress({
          decisions: { bassAreaNotSuitable: true },
          tasks: { curfewAddress: 'DONE' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/bassReferral/rejected/',
        type: 'link',
        dataQa: 'curfew-address',
      })
    })

    test('should show continue btn to bassReferral/rejected if bassAreaNotSuitable && curfewAddress: !DONE || UNSTARTED', () => {
      expect(
        curfewAddress({
          decisions: { bassAreaNotSuitable: true },
          tasks: { curfewAddress: 'SOMETHING' },
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/bassReferral/rejected/',
        type: 'btn',
      })
    })

    test('should show btn to curfewAddressChoice if all = UNSTARTED', () => {
      expect(
        curfewAddress({
          decisions: {},
          tasks: { curfewAddress: 'UNSTARTED', optOut: 'UNSTARTED', bassRequest: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Start now',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
      })
    })

    test('should show change link to curfewAddressChoice if all = DONE', () => {
      expect(
        curfewAddress({
          decisions: {},
          tasks: { curfewAddress: 'DONE', optOut: 'DONE', bassRequest: 'DONE' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
      })
    })

    test('should show continue btn to curfewAddressChoice if any not DONE', () => {
      expect(
        curfewAddress({
          decisions: {},
          tasks: { curfewAddress: 'SOMETHING', optOut: 'DONE', bassRequest: 'DONE' },
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
      })
    })
  })
})
