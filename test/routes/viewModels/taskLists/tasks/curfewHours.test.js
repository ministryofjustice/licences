const { getLabel, getRoAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/curfewHours')

describe('curfew hours task', () => {
  describe('getLabel', () => {
    test('should Completed if task is done', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { curfewHours: 'DONE' },
        })
      ).toBe('Confirmed')
    })

    test('should Not completed if task is not done', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { curfewHours: 'SOMETHING' },
        })
      ).toBe('Not completed')
    })
  })

  describe('getRoAction', () => {
    test('should show btn to curfewHours if curfewHours: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { curfewHours: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/curfew/curfewHours/',
        type: 'btn',
      })
    })

    test('should show change link to curfewHours if curfewHours: DONE', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { curfewHours: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/curfew/curfewHours/',
        type: 'link',
      })
    })

    test('should show continue btn to curfewHours if curfewHours: !DONE || UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { curfewHours: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/curfew/curfewHours/',
        type: 'btn',
      })
    })
  })
})
