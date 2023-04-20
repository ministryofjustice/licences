const bassAddress = require('../../../../../server/routes/viewModels/taskLists/tasks/bassAddress')

describe('bass address task', () => {
  describe('getLabel', () => {
    test('should return CAS2 area rejected if decision = true', () => {
      expect(
        bassAddress.ca.standard({
          decisions: { bassAreaNotSuitable: true },
          tasks: {},
        }).label
      ).toBe('CAS2 area rejected')
    })

    test('should return CAS2 offer withdrawn if suitable, withdrawn and bassWithdrawalReason === offer', () => {
      expect(
        bassAddress.ca.standard({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: true, bassWithdrawalReason: 'offer' },
          tasks: {},
        }).label
      ).toBe('CAS2 offer withdrawn')
    })

    test('should return CAS2 request withdrawn if suitable, withdrawn and bassWithdrawalReason !== offer', () => {
      expect(
        bassAddress.ca.standard({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: true, bassWithdrawalReason: 'something' },
          tasks: {},
        }).label
      ).toBe('CAS2 request withdrawn')
    })

    test('should return Offer made and address provided if bass offer made and bass address DONE', () => {
      expect(
        bassAddress.ca.standard({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: false, bassAccepted: 'Yes' },
          tasks: { bassOffer: 'DONE', bassAddress: 'DONE' },
        }).label
      ).toBe('Offer made and address provided')
    })

    test('should return Offer made, awaiting address if bass offer made and bass address not DONE', () => {
      expect(
        bassAddress.ca.standard({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: false, bassAccepted: 'Yes' },
          tasks: { bassOffer: 'DONE', bassAddress: 'SOMTHING' },
        }).label
      ).toBe('Offer made, awaiting address')
    })

    test('should return warning if Offer not made', () => {
      expect(
        bassAddress.ca.standard({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: false, bassAccepted: 'Unsuitable' },
          tasks: { bassOffer: 'DONE' },
        }).label
      ).toBe('WARNING||Not suitable for BASS')
    })

    test('should return warning if Offer not made but not deemed unsuitable', () => {
      expect(
        bassAddress.ca.standard({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: false, bassAccepted: 'Something' },
          tasks: { bassOffer: 'DONE' },
        }).label
      ).toBe('WARNING||Address not available')
    })

    test('should return Not completed if none of the above', () => {
      expect(
        bassAddress.ca.standard({
          decisions: { bassAreaNotSuitable: false, bassWithdrawn: false },
          tasks: { bassOffer: 'SOMETHING' },
        }).label
      ).toBe('Not completed')
    })
  })

  describe('getCaAction', () => {
    test('should show btn to curfewAddressReview if curfewAddressReview: UNSTARTED', () => {
      expect(
        bassAddress.ca.standard({
          decisions: {},
          tasks: { bassAddress: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Start now',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'btn',
      })
    })

    test('should show change link to curfewAddressReview if curfewAddressReview: DONE', () => {
      expect(
        bassAddress.ca.standard({
          decisions: {},
          tasks: { bassAddress: 'DONE' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'link',
      })
    })

    test('should show continue btn to curfewAddressReview if curfewAddressReview: !DONE || UNSTARTED', () => {
      expect(
        bassAddress.ca.standard({
          decisions: {},
          tasks: { bassAddress: 'SOMETHING' },
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'btn',
      })
    })
  })
})

describe('bass offer', () => {
  describe('getLabel', () => {
    describe('standard', () => {
      test('should return CAS2 area rejected if bassAreaNotSuitable = true', () => {
        expect(
          bassAddress.ca.standard({
            decisions: { bassAreaNotSuitable: true },
            tasks: {},
          }).label
        ).toBe('CAS2 area rejected')
      })

      test('should return CAS2 offer withdrawn if bassWithdrawalReason = offer', () => {
        expect(
          bassAddress.ca.standard({
            decisions: { bassWithdrawn: true, bassWithdrawalReason: 'offer' },
            tasks: {},
          }).label
        ).toBe('CAS2 offer withdrawn')
      })

      test('should return CAS2 offer withdrawn if bassWithdrawalReason != offer', () => {
        expect(
          bassAddress.ca.standard({
            decisions: { bassWithdrawn: true, bassWithdrawalReason: 'something else' },
            tasks: {},
          }).label
        ).toBe('CAS2 request withdrawn')
      })
    })

    describe('postApproval', () => {
      test('should return offer made if bassOffer = DONE && bassAccepted = Yes', () => {
        expect(
          bassAddress.ca.postApproval({
            decisions: { bassAccepted: 'Yes' },
            tasks: { bassOffer: 'DONE' },
          }).label
        ).toBe('Offer made')
      })

      test('should return Not suitable for BASS if bassOffer = DONE && bassAccepted === Unsuitable', () => {
        expect(
          bassAddress.ca.postApproval({
            decisions: { bassAccepted: 'Unsuitable' },
            tasks: { bassOffer: 'DONE' },
          }).label
        ).toBe('WARNING||Not suitable for BASS')
      })

      test('should return Address not available if bassOffer = DONE && bassAccepted !== Unsuitable or Yes', () => {
        expect(
          bassAddress.ca.postApproval({
            decisions: { bassAccepted: 'Something else' },
            tasks: { bassOffer: 'DONE' },
          }).label
        ).toBe('WARNING||Address not available')
      })

      test('should return Not completed if bassAreaCheck == DONE && bassAreaSuitable', () => {
        expect(
          bassAddress.ca.postApproval({
            decisions: { bassAreaSuitable: true },
            tasks: { bassAreaCheck: 'DONE' },
          }).label
        ).toBe('Not completed')
      })

      test('should return CAS2 referral requested if bassAreaCheck == DONE && !bassAreaSuitable', () => {
        expect(
          bassAddress.ca.postApproval({
            decisions: { bassAreaSuitable: false },
            tasks: { bassOffer: 'UNSTARTED' },
          }).label
        ).toBe('CAS2 referral requested')
      })

      test('should return CAS2 referral requested if !bassAreaNotSuitable, !bassWithdrawn, bassOffer !== DONE, bassAreaCheck !== DONE', () => {
        expect(
          bassAddress.ca.postApproval({
            decisions: { bassAreaNotSuitable: false, bassWithdrawn: false },
            tasks: { bassOffer: 'UNSTARTED', bassAreaCheck: 'UNSTARTED' },
          }).label
        ).toBe('CAS2 referral requested')
      })
    })
  })

  describe('getAction', () => {
    test('Should link to approved premises choice if approved premises required regardless of anything else #1', () => {
      expect(
        bassAddress.ca.postApproval({
          decisions: { bassWithdrawn: true, approvedPremisesRequired: true },
          tasks: {},
        }).action
      ).toEqual({
        text: 'View/Edit',
        href: '/hdc/bassReferral/approvedPremisesChoice/',
        type: 'btn-secondary',
        dataQa: 'approved-premises-choice',
      })
    })

    test('Should link to approved premises choice if approved premises required regardless of anything else #2', () => {
      expect(
        bassAddress.ca.postApproval({
          decisions: { bassWithdrawn: false, approvedPremisesRequired: true },
          tasks: {},
        }).action
      ).toEqual({
        text: 'View/Edit',
        href: '/hdc/bassReferral/approvedPremisesChoice/',
        type: 'btn-secondary',
        dataQa: 'approved-premises-choice',
      })
    })

    test('should link to bass offer if bassWithdrawn', () => {
      expect(
        bassAddress.ca.postApproval({
          decisions: { bassWithdrawn: true, approvedPremisesRequired: false },
          tasks: {},
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'link',
        dataQa: 'bass-address',
      })
    })

    test('should show btn to bassOffer if checks: DONE && bassOffer: UNSTARTED', () => {
      expect(
        bassAddress.ca.postApproval({
          decisions: { bassWithdrawn: false, approvedPremisesRequired: false },
          tasks: { bassAreaCheck: 'DONE', bassOffer: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Start now',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'btn',
      })
    })

    test('should show change link to bassOffer if checks: DONE && bassOffer: DONE', () => {
      expect(
        bassAddress.ca.postApproval({
          decisions: { bassWithdrawn: false, approvedPremisesRequired: false },
          tasks: { bassAreaCheck: 'DONE', bassOffer: 'DONE' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'link',
        dataQa: 'bass-address',
      })
    })

    test('should show continue btn to bassOffer if checks: DONE && bassOffer: !DONE || UNSTARTED', () => {
      expect(
        bassAddress.ca.postApproval({
          decisions: { bassWithdrawn: false, approvedPremisesRequired: false },
          tasks: { bassAreaCheck: 'DONE', bassOffer: 'SOMETHING' },
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/bassReferral/bassOffer/',
        type: 'btn',
      })
    })

    test('should go to 3 way choice if checks: !DONE && !bassWithdrawn && optout, curfewAddress, bassRequest == UNSTARTED', () => {
      expect(
        bassAddress.ca.postApproval({
          decisions: { bassWithdrawn: false, approvedPremisesRequired: false },
          tasks: {
            bassAreaCheck: 'SOMETHING',
            optOut: 'UNSTARTED',
            curfewAddress: 'UNSTARTED',
            bassRequest: 'UNSTARTED',
          },
        }).action
      ).toEqual({
        text: 'Start now',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
        dataQa: 'bass-address',
      })
    })

    test('should link to 3 way choice if checks: !DONE && !bassWithdrawn && optout, curfewAddress, bassRequest == DONE', () => {
      expect(
        bassAddress.ca.postApproval({
          decisions: { bassWithdrawn: false, approvedPremisesRequired: false },
          tasks: { bassAreaCheck: 'SOMETHING', optOut: 'DONE', curfewAddress: 'DONE', bassRequest: 'DONE' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
        dataQa: 'bass-address',
      })
    })

    test('should continue to 3 way choice if checks: !DONE && !bassWithdrawn && any optout, curfewAddress, bassRequest != DONE', () => {
      expect(
        bassAddress.ca.postApproval({
          decisions: { bassWithdrawn: false, approvedPremisesRequired: false },
          tasks: {
            bassAreaCheck: 'SOMETHING',
            optOut: 'UNSTARTED',
            curfewAddress: 'DONE',
            bassRequest: 'DONE',
          },
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
        dataQa: 'bass-address',
      })
    })
  })
})
