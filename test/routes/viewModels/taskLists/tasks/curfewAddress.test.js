const { getLabel, getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/curfewAddress')

describe('curfew address task', () => {
  describe('getLabel', () => {
    test('should return Offender has opted out of HDC if optedOut = true', () => {
      expect(
        getLabel({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).toBe('Offender has opted out of HDC')
    })

    test('should return BASS area rejected if bassReferralNeeded and bassAreaNotSuitable', () => {
      expect(
        getLabel({
          decisions: { optedOut: false, bassReferralNeeded: true, bassAreaNotSuitable: true },
          tasks: {},
        })
      ).toBe('ALERT||BASS area rejected')
    })

    test('should return Completed if bassReferralNeeded && bassRequest = DONE', () => {
      expect(
        getLabel({
          decisions: { optedOut: false, bassReferralNeeded: true, bassAreaNotSuitable: false },
          tasks: { bassRequest: 'DONE' },
        })
      ).toBe('Completed')
    })

    test('should return Not completed if bassReferralNeeded && bassRequest not DONE', () => {
      expect(
        getLabel({
          decisions: { optedOut: false, bassReferralNeeded: true, bassAreaNotSuitable: false },
          tasks: { bassRequest: 'SOMETHING' },
        })
      ).toBe('Not completed')
    })

    test('should return Address rejected curfewAddressRejected', () => {
      expect(
        getLabel({
          decisions: { optedOut: false, bassReferralNeeded: false, curfewAddressRejected: true },
          tasks: {},
        })
      ).toBe('ALERT||Address rejected')
    })

    test('should return Completed if curfewAddress: DONE', () => {
      expect(
        getLabel({
          decisions: { optedOut: false, bassReferralNeeded: false, curfewAddressRejected: false },
          tasks: { curfewAddress: 'DONE' },
        })
      ).toBe('Completed')
    })

    test('should return Not completed if curfewAddress not DONE', () => {
      expect(
        getLabel({
          decisions: { optedOut: false, bassReferralNeeded: false, curfewAddressRejected: false },
          tasks: { curfewAddress: 'SOMETHING' },
        })
      ).toBe('Not completed')
    })
  })

  describe('getCaAction', () => {
    test('should show btn to proposedAddress/rejected/ if curfewAddressRejected && curfewAddress: UNSTARTED', () => {
      expect(
        getCaAction({
          decisions: { curfewAddressRejected: true },
          tasks: { curfewAddress: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/proposedAddress/rejected/',
        type: 'btn',
      })
    })

    test('should show change link to proposedAddress/rejected/ if curfewAddressRejected && curfewAddress: DONE', () => {
      expect(
        getCaAction({
          decisions: { curfewAddressRejected: true },
          tasks: { curfewAddress: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/proposedAddress/rejected/',
        type: 'link',
        dataQa: 'curfew-address',
      })
    })

    test('should show continue btn to proposedAddress/rejected/ if curfewAddressRejected && curfewAddress: !DONE || UNSTARTED', () => {
      expect(
        getCaAction({
          decisions: { curfewAddressRejected: true },
          tasks: { curfewAddress: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/proposedAddress/rejected/',
        type: 'btn',
      })
    })

    test('should show btn to bassReferral/rejected/ if bassAreaNotSuitable && curfewAddress: UNSTARTED', () => {
      expect(
        getCaAction({
          decisions: { bassAreaNotSuitable: true },
          tasks: { curfewAddress: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/bassReferral/rejected/',
        type: 'btn',
      })
    })

    test('should show change link to bassReferral/rejected if bassAreaNotSuitable && curfewAddress: DONE', () => {
      expect(
        getCaAction({
          decisions: { bassAreaNotSuitable: true },
          tasks: { curfewAddress: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/bassReferral/rejected/',
        type: 'link',
        dataQa: 'curfew-address',
      })
    })

    test('should show continue btn to bassReferral/rejected if bassAreaNotSuitable && curfewAddress: !DONE || UNSTARTED', () => {
      expect(
        getCaAction({
          decisions: { bassAreaNotSuitable: true },
          tasks: { curfewAddress: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/bassReferral/rejected/',
        type: 'btn',
      })
    })

    test('should show btn to curfewAddressChoice if all = UNSTARTED', () => {
      expect(
        getCaAction({
          decisions: {},
          tasks: { curfewAddress: 'UNSTARTED', optOut: 'UNSTARTED', bassRequest: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
      })
    })

    test('should show change link to curfewAddressChoice if all = DONE', () => {
      expect(
        getCaAction({
          decisions: {},
          tasks: { curfewAddress: 'DONE', optOut: 'DONE', bassRequest: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
      })
    })

    test('should show continue btn to curfewAddressChoice if any not DONE', () => {
      expect(
        getCaAction({
          decisions: {},
          tasks: { curfewAddress: 'SOMETHING', optOut: 'DONE', bassRequest: 'DONE' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
      })
    })
  })
})
