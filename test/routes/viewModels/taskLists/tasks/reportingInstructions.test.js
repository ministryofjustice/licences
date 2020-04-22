const reportingInstructions = require('../../../../../server/routes/viewModels/taskLists/tasks/reportingInstructions')

describe('reporting instructions task', () => {
  describe('label', () => {
    test('should return Victim liaison required if task DONE', () => {
      expect(
        reportingInstructions.edit({
          decisions: {},
          tasks: { reportingInstructions: 'DONE' },
        }).label
      ).toBe('Confirmed')
    })

    test('should return No victim liaison required if task not DONE', () => {
      expect(
        reportingInstructions.edit({
          decisions: {},
          tasks: { reportingInstructions: 'SOMETHING' },
        }).label
      ).toBe('Not completed')
    })
  })

  describe('RO action', () => {
    test('should show btn to reportingInstructions if reportingInstructions: UNSTARTED', () => {
      expect(
        reportingInstructions.ro({
          decisions: {},
          tasks: { reportingInstructions: 'UNSTARTED' },
        }).action
      ).toEqual({
        text: 'Start now',
        href: '/hdc/reporting/reportingInstructions/',
        type: 'btn',
      })
    })

    test('should show change link to reportingInstructions if reportingInstructions: DONE', () => {
      expect(
        reportingInstructions.ro({
          decisions: {},
          tasks: { reportingInstructions: 'DONE' },
        }).action
      ).toEqual({
        text: 'Change',
        href: '/hdc/reporting/reportingInstructions/',
        type: 'link',
      })
    })

    test('should show continue btn to reportingInstructions if reportingInstructions: !DONE || UNSTARTED', () => {
      expect(
        reportingInstructions.ro({
          decisions: {},
          tasks: { reportingInstructions: 'SOMETHING' },
        }).action
      ).toEqual({
        text: 'Continue',
        href: '/hdc/reporting/reportingInstructions/',
        type: 'btn',
      })
    })
  })
})
