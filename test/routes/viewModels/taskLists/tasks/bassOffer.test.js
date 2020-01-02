const { getLabel, getAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/bassOffer')

describe('bass offer task', () => {
  describe('getLabel', () => {
    test('should return Bass area rejected if bassAreaNotSuitable = true', () => {
      expect(
        getLabel({
          decisions: { bassAreaNotSuitable: true },
          tasks: {},
        })
      ).toBe('BASS area rejected')
    })

    test('should return BASS offer withdrawn if bassWithdrawalReason = offer', () => {
      expect(
        getLabel({
          decisions: { bassWithdrawn: true, bassWithdrawalReason: 'offer' },
          tasks: {},
        })
      ).toBe('BASS offer withdrawn')
    })

    test('should return BASS offer withdrawn if bassWithdrawalReason != offer', () => {
      expect(
        getLabel({
          decisions: { bassWithdrawn: true, bassWithdrawalReason: 'something else' },
          tasks: {},
        })
      ).toBe('BASS request withdrawn')
    })

    test('should return offer made if bassOffer = DONE && bassAccepted = Yes', () => {
      expect(
        getLabel({
          decisions: { bassAccepted: 'Yes' },
          tasks: { bassOffer: 'DONE' },
        })
      ).toBe('Offer made')
    })

    test('should return Not suitable for BASS if bassOffer = DONE && bassAccepted === Unsuitable', () => {
      expect(
        getLabel({
          decisions: { bassAccepted: 'Unsuitable' },
          tasks: { bassOffer: 'DONE' },
        })
      ).toBe('WARNING||Not suitable for BASS')
    })

    test('should return Address not available if bassOffer = DONE && bassAccepted !== Unsuitable or Yes', () => {
      expect(
        getLabel({
          decisions: { bassAccepted: 'Something else' },
          tasks: { bassOffer: 'DONE' },
        })
      ).toBe('WARNING||Address not available')
    })

    test('should return Not completed if bassAreaCheck == DONE && bassAreaSuitable', () => {
      expect(
        getLabel({
          decisions: { bassAreaSuitable: true },
          tasks: { bassAreaCheck: 'DONE' },
        })
      ).toBe('Not completed')
    })

    test('should return BASS referral requested if bassAreaCheck == DONE && !bassAreaSuitable', () => {
      expect(
        getLabel({
          decisions: { bassAreaSuitable: false },
          tasks: { bassOffer: 'UNSTARTED' },
        })
      ).toBe('BASS referral requested')
    })

    test('should return BASS referral requested if !bassAreaNotSuitable, !bassWithdrawn, bassOffer !== DONE, bassAreaCheck !== DONE', () => {
      expect(
        getLabel({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: false },
          tasks: { bassOffer: 'UNSTARTED', bassAreaCheck: 'UNSTARTED' },
        })
      ).toBe('BASS referral requested')
    })
  })

  describe('getAction', () => {
    test('should link to bass offer if bassWithdrawn', () => {
      expect(
        getAction({
          decisions: { bassWithdrawn: true },
          tasks: {},
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'link',
      })
    })

    test('should show btn to bassOffer if checks: DONE && bassOffer: UNSTARTED', () => {
      expect(
        getAction({
          decisions: { bassWithdrawn: false },
          tasks: { bassAreaCheck: 'DONE', bassOffer: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'btn',
      })
    })

    test('should show change link to bassOffer if checks: DONE && bassOffer: DONE', () => {
      expect(
        getAction({
          decisions: { bassWithdrawn: false },
          tasks: { bassAreaCheck: 'DONE', bassOffer: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'link',
      })
    })

    test('should show continue btn to bassOffer if checks: DONE && bassOffer: !DONE || UNSTARTED', () => {
      expect(
        getAction({
          decisions: { bassWithdrawn: false },
          tasks: { bassAreaCheck: 'DONE', bassOffer: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'btn',
      })
    })

    test('should go to 3 way choice if checks: !DONE && !bassWithdrawn && optout, curfewAddress, bassRequest == UNSTARTED', () => {
      expect(
        getAction({
          decisions: { bassWithdrawn: false },
          tasks: {
            bassAreaCheck: 'SOMETHING',
            optOut: 'UNSTARTED',
            curfewAddress: 'UNSTARTED',
            bassRequest: 'UNSTARTED',
          },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
      })
    })

    test('should link to 3 way choice if checks: !DONE && !bassWithdrawn && optout, curfewAddress, bassRequest == DONE', () => {
      expect(
        getAction({
          decisions: { bassWithdrawn: false },
          tasks: { bassAreaCheck: 'SOMETHING', optOut: 'DONE', curfewAddress: 'DONE', bassRequest: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
      })
    })

    test('should continue to 3 way choice if checks: !DONE && !bassWithdrawn && any optout, curfewAddress, bassRequest != DONE', () => {
      expect(
        getAction({
          decisions: { bassWithdrawn: false },
          tasks: {
            bassAreaCheck: 'SOMETHING',
            optOut: 'UNSTARTED',
            curfewAddress: 'DONE',
            bassRequest: 'DONE',
          },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
      })
    })
  })
})
