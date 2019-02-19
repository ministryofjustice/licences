const { getLabel, getCaAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/proposedAddress')

describe('victim liaison task', () => {
  describe('getLabel', () => {
    it('should return Offender has opted out of HDC if optedOut = true', () => {
      expect(
        getLabel({
          decisions: { optedOut: true },
          tasks: {},
        })
      ).to.equal('Offender has opted out of HDC')
    })

    it('should return BASS area rejected if bassReferralNeeded and bassAreaNotSuitable', () => {
      expect(
        getLabel({
          decisions: { optedOut: false, bassReferralNeeded: true, bassAreaNotSuitable: true },
          tasks: {},
        })
      ).to.equal('ALERT||BASS area rejected')
    })

    it('should return Completed if bassReferralNeeded && bassRequest = DONE', () => {
      expect(
        getLabel({
          decisions: { optedOut: false, bassReferralNeeded: true, bassAreaNotSuitable: false },
          tasks: { bassRequest: 'DONE' },
        })
      ).to.equal('Completed')
    })

    it('should return Not completed if bassReferralNeeded && bassRequest not DONE', () => {
      expect(
        getLabel({
          decisions: { optedOut: false, bassReferralNeeded: true, bassAreaNotSuitable: false },
          tasks: { bassRequest: 'SOMETHING' },
        })
      ).to.equal('Not completed')
    })

    it('should return Address rejected curfewAddressRejected', () => {
      expect(
        getLabel({
          decisions: { optedOut: false, bassReferralNeeded: false, curfewAddressRejected: true },
          tasks: {},
        })
      ).to.equal('ALERT||Address rejected')
    })

    it('should return Completed if curfewAddress: DONE', () => {
      expect(
        getLabel({
          decisions: { optedOut: false, bassReferralNeeded: false, curfewAddressRejected: false },
          tasks: { curfewAddress: 'DONE' },
        })
      ).to.equal('Completed')
    })

    it('should return Not completed if curfewAddress not DONE', () => {
      expect(
        getLabel({
          decisions: { optedOut: false, bassReferralNeeded: false, curfewAddressRejected: false },
          tasks: { curfewAddress: 'SOMETHING' },
        })
      ).to.equal('Not completed')
    })
  })

  describe('getCaAction', () => {
    it('should show btn to proposedAddress/rejected/ if curfewAddressRejected && curfewAddress: UNSTARTED', () => {
      expect(
        getCaAction({
          decisions: { curfewAddressRejected: true },
          tasks: { curfewAddress: 'UNSTARTED' },
        })
      ).to.eql({
        text: 'Start now',
        href: '/hdc/proposedAddress/rejected/',
        type: 'btn',
      })
    })

    it('should show change link to proposedAddress/rejected/ if curfewAddressRejected && curfewAddress: DONE', () => {
      expect(
        getCaAction({
          decisions: { curfewAddressRejected: true },
          tasks: { curfewAddress: 'DONE' },
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/proposedAddress/rejected/',
        type: 'link',
      })
    })

    it('should show continue btn to proposedAddress/rejected/ if curfewAddressRejected && curfewAddress: !DONE || UNSTARTED', () => {
      expect(
        getCaAction({
          decisions: { curfewAddressRejected: true },
          tasks: { curfewAddress: 'SOMETHING' },
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/proposedAddress/rejected/',
        type: 'btn',
      })
    })

    it('should show btn to bassReferral/rejected/ if bassAreaNotSuitable && curfewAddress: UNSTARTED', () => {
      expect(
        getCaAction({
          decisions: { bassAreaNotSuitable: true },
          tasks: { curfewAddress: 'UNSTARTED' },
        })
      ).to.eql({
        text: 'Start now',
        href: '/hdc/bassReferral/rejected/',
        type: 'btn',
      })
    })

    it('should show change link to bassReferral/rejected if bassAreaNotSuitable && curfewAddress: DONE', () => {
      expect(
        getCaAction({
          decisions: { bassAreaNotSuitable: true },
          tasks: { curfewAddress: 'DONE' },
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/bassReferral/rejected/',
        type: 'link',
      })
    })

    it('should show continue btn to bassReferral/rejected if bassAreaNotSuitable && curfewAddress: !DONE || UNSTARTED', () => {
      expect(
        getCaAction({
          decisions: { bassAreaNotSuitable: true },
          tasks: { curfewAddress: 'SOMETHING' },
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/bassReferral/rejected/',
        type: 'btn',
      })
    })

    it('should show btn to curfewAddressChoice if all = UNSTARTED', () => {
      expect(
        getCaAction({
          decisions: {},
          tasks: { curfewAddress: 'UNSTARTED', optOut: 'UNSTARTED', bassRequest: 'UNSTARTED' },
        })
      ).to.eql({
        text: 'Start now',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
      })
    })

    it('should show change link to curfewAddressChoice if all = DONE', () => {
      expect(
        getCaAction({
          decisions: {},
          tasks: { curfewAddress: 'DONE', optOut: 'DONE', bassRequest: 'DONE' },
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'link',
      })
    })

    it('should show continue btn to curfewAddressChoice if any not DONE', () => {
      expect(
        getCaAction({
          decisions: {},
          tasks: { curfewAddress: 'SOMETHING', optOut: 'DONE', bassRequest: 'DONE' },
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/proposedAddress/curfewAddressChoice/',
        type: 'btn',
      })
    })
  })
})
