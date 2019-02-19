const { getLabel, getRoAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/victimLiaison')

describe('victim liaison task', () => {
  describe('getLabel', () => {
    it('should return Victim liaison required if task DONE and victimLiaisonNeeded = true', () => {
      expect(
        getLabel({
          decisions: { victimLiaisonNeeded: true },
          tasks: { victim: 'DONE' },
        })
      ).to.equal('Victim liaison required')
    })

    it('should return No victim liaison required if task DONE and victimLiaisonNeeded = false', () => {
      expect(
        getLabel({
          decisions: { victimLiaisonNeeded: false },
          tasks: { victim: 'DONE' },
        })
      ).to.equal('No victim liaison required')
    })

    it('should Not completed if task is not done', () => {
      expect(
        getLabel({
          decisions: { victimLiaisonNeeded: false },
          tasks: { victim: 'SOMETHING' },
        })
      ).to.equal('Not completed')
    })
  })

  describe('getRoAction', () => {
    it('should show btn to curfewAddressReview if curfewAddressReview: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { victim: 'UNSTARTED' },
        })
      ).to.eql({
        text: 'Start now',
        href: '/hdc/victim/victimLiaison/',
        type: 'btn',
      })
    })

    it('should show change link to curfewAddressReview if curfewAddressReview: DONE', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { victim: 'DONE' },
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/victim/victimLiaison/',
        type: 'link',
      })
    })

    it('should show continue btn to curfewAddressReview if curfewAddressReview: !DONE || UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { victim: 'SOMETHING' },
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/victim/victimLiaison/',
        type: 'btn',
      })
    })
  })
})
