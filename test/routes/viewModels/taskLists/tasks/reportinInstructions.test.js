const {
  getLabel,
  getRoAction,
} = require('../../../../../server/routes/viewModels/taskLists/tasks/reportingInstructions')

describe('reporting instructions task', () => {
  describe('getLabel', () => {
    test('should return Victim liaison required if task DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { reportingInstructions: 'DONE' },
        })
      ).toBe('Confirmed')
    })

    test('should return No victim liaison required if task not DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { reportingInstructions: 'SOMETHING' },
        })
      ).toBe('Not completed')
    })
  })

  describe('getRoAction', () => {
    test('should show btn to reportingInstructions if reportingInstructions: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { reportingInstructions: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/reporting/reportingInstructions/',
        type: 'btn',
      })
    })

    test('should show change link to reportingInstructions if reportingInstructions: DONE', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { reportingInstructions: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/reporting/reportingInstructions/',
        type: 'link',
      })
    })

    test('should show continue btn to reportingInstructions if reportingInstructions: !DONE || UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { reportingInstructions: 'SOMETHING' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/reporting/reportingInstructions/',
        type: 'btn',
      })
    })
  })
})
