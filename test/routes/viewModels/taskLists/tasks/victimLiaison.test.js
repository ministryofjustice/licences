const victimLiaison = require('../../../../../server/routes/viewModels/taskLists/tasks/victimLiaison')

describe('victim liaison task', () => {
  describe('getLabel', () => {
    test('should return Victim liaison required if task DONE and victimLiaisonNeeded = true', () => {
      expect(
        victimLiaison.edit({
          decisions: { victimLiaisonNeeded: true },
          tasks: { victim: 'DONE' },
        }).label
      ).toBe('Victim liaison required')
    })

    test('should return No victim liaison required if task DONE and victimLiaisonNeeded = false', () => {
      expect(
        victimLiaison.edit({
          decisions: { victimLiaisonNeeded: false },
          tasks: { victim: 'DONE' },
        }).label
      ).toBe('No victim liaison required')
    })

    test('should Not completed if task is not done', () => {
      expect(
        victimLiaison.edit({
          decisions: { victimLiaisonNeeded: false },
          tasks: { victim: 'SOMETHING' },
        }).label
      ).toBe('Not completed')
    })
  })

  describe('getRoAction', () => {
    test('should show btn to curfewAddressReview if curfewAddressReview: UNSTARTED', () => {
      expect(
        victimLiaison.ro({
          decisions: {},
          tasks: { victim: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Start now',
        href: '/hdc/victim/victimLiaison/',
        type: 'btn',
      })
    })

    test('should show change link to curfewAddressReview if curfewAddressReview: DONE', () => {
      expect(
        victimLiaison.ro({
          decisions: {},
          tasks: { victim: 'DONE' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/victim/victimLiaison/',
        type: 'link',
      })
    })

    test('should show continue btn to curfewAddressReview if curfewAddressReview: !DONE || UNSTARTED', () => {
      expect(
        victimLiaison.ro({
          decisions: {},
          tasks: { victim: 'SOMETHING' },
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/victim/victimLiaison/',
        type: 'btn',
      })
    })
  })
})
