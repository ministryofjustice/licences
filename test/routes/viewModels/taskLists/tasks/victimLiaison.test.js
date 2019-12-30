const { getLabel, getRoAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/victimLiaison')

describe('victim liaison task', () => {
  describe('getLabel', () => {
    test('should return Victim liaison required if task DONE and victimLiaisonNeeded = true', () => {
      expect(
        getLabel({
          decisions: { victimLiaisonNeeded: true },
          tasks: { victim: 'DONE' },
        })
      ).toBe('Victim liaison required')
    })

    test('should return No victim liaison required if task DONE and victimLiaisonNeeded = false', () => {
      expect(
        getLabel({
          decisions: { victimLiaisonNeeded: false },
          tasks: { victim: 'DONE' },
        })
      ).toBe('No victim liaison required')
    })

    test('should Not completed if task is not done', () => {
      expect(
        getLabel({
          decisions: { victimLiaisonNeeded: false },
          tasks: { victim: 'SOMETHING' },
        })
      ).toBe('Not completed')
    })
  })

  describe('getRoAction', () => {
    test('should show btn to curfewAddressReview if curfewAddressReview: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { victim: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/victim/victimLiaison/',
        type: 'btn',
      })
    })

    test('should show change link to curfewAddressReview if curfewAddressReview: DONE', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { victim: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/victim/victimLiaison/',
        type: 'link',
      })
    })

    test('should show continue btn to curfewAddressReview if curfewAddressReview: !DONE || UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { victim: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/victim/victimLiaison/',
        type: 'btn',
      })
    })
  })
})
