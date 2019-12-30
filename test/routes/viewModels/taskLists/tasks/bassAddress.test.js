const { getLabel, getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/bassAddress')

describe('bass address task', () => {
  describe('getLabel', () => {
    test('should return BASS area rejected if decision = true', () => {
      expect(
        getLabel({
          decisions: { bassAreaNotSuitable: true },
          tasks: {},
        })
      ).toBe('BASS area rejected')
    })

    test('should return BASS offer withdrawn if suitable, withdrawn and bassWithdrawalReason === offer', () => {
      expect(
        getLabel({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: true, bassWithdrawalReason: 'offer' },
          tasks: {},
        })
      ).toBe('BASS offer withdrawn')
    })

    test('should return BASS request withdrawn if suitable, withdrawn and bassWithdrawalReason !== offer', () => {
      expect(
        getLabel({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: true, bassWithdrawalReason: 'something' },
          tasks: {},
        })
      ).toBe('BASS request withdrawn')
    })

    test('should return Offer made and address provided if bass offer made and bass address DONE', () => {
      expect(
        getLabel({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: false, bassAccepted: 'Yes' },
          tasks: { bassOffer: 'DONE', bassAddress: 'DONE' },
        })
      ).toBe('Offer made and address provided')
    })

    test('should return Offer made, awaiting address if bass offer made and bass address not DONE', () => {
      expect(
        getLabel({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: false, bassAccepted: 'Yes' },
          tasks: { bassOffer: 'DONE', bassAddress: 'SOMTHING' },
        })
      ).toBe('Offer made, awaiting address')
    })

    test('should return warning if Offer not made', () => {
      expect(
        getLabel({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: false, bassAccepted: 'Unsuitable' },
          tasks: { bassOffer: 'DONE' },
        })
      ).toBe('WARNING||Not suitable for BASS')
    })

    test('should return warning if Offer not made but not deemed unsuitable', () => {
      expect(
        getLabel({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: false, bassAccepted: 'Something' },
          tasks: { bassOffer: 'DONE' },
        })
      ).toBe('WARNING||Address not available')
    })

    test('should return Not completed if none of the above', () => {
      expect(
        getLabel({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: false },
          tasks: { bassOffer: 'SOMETHING' },
        })
      ).toBe('Not completed')
    })
  })

  describe('getCaAction', () => {
    test('should show btn to curfewAddressReview if curfewAddressReview: UNSTARTED', () => {
      expect(
        getCaAction({
          decisions: {},
          tasks: { bassAddress: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'btn',
      })
    })

    test('should show change link to curfewAddressReview if curfewAddressReview: DONE', () => {
      expect(
        getCaAction({
          decisions: {},
          tasks: { bassAddress: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'link',
      })
    })

    test('should show continue btn to curfewAddressReview if curfewAddressReview: !DONE || UNSTARTED', () => {
      expect(
        getCaAction({
          decisions: {},
          tasks: { bassAddress: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'btn',
      })
    })
  })
})
