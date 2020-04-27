const curfewHours = require('../../../../../server/routes/viewModels/taskLists/tasks/curfewHours')

describe('curfew hours task', () => {
  describe('getLabel', () => {
    test('should Completed if task is done', () => {
      expect(
        curfewHours.edit({
          tasks: { curfewHours: 'DONE' },
        }).label
      ).toBe('Confirmed')
    })

    test('should Not completed if task is not done', () => {
      expect(
        curfewHours.edit({
          tasks: { curfewHours: 'SOMETHING' },
        }).label
      ).toBe('Not completed')
    })
  })

  describe('getRoAction', () => {
    test('should show btn to curfewHours if curfewHours: UNSTARTED', () => {
      expect(
        curfewHours.ro({
          tasks: { curfewHours: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Start now',
        href: '/hdc/curfew/curfewHours/',
        type: 'btn',
      })
    })

    test('should show change link to curfewHours if curfewHours: DONE', () => {
      expect(
        curfewHours.ro({
          tasks: { curfewHours: 'DONE' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/curfew/curfewHours/',
        type: 'link',
      })
    })

    test('should show continue btn to curfewHours if curfewHours: !DONE || UNSTARTED', () => {
      expect(
        curfewHours.ro({
          tasks: { curfewHours: 'SOMETHING' },
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/curfew/curfewHours/',
        type: 'btn',
      })
    })
  })
})
