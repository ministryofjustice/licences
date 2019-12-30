const {
  getLabel,
  getCaProcessingAction,
} = require('../../../../../server/routes/viewModels/taskLists/tasks/finalChecks')

describe('final checks task', () => {
  describe('getLabel', () => {
    test('should return Confirmed if task DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { finalChecks: 'DONE' },
        })
      ).toBe('Confirmed')
    })

    test('should return not completed if task not DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { finalChecks: 'UNSTARTED' },
        })
      ).toBe('Not completed')
    })

    test('should return warning message when any checks failed', () => {
      expect(
        getLabel({
          decisions: { onRemand: true },
          tasks: { finalChecks: 'DONE' },
        })
      ).toBe('WARNING||The offender is on remand')
    })

    test('should return multiple warning messages when multiple checks failed', () => {
      const labels = getLabel({
        decisions: { seriousOffence: true, onRemand: true, confiscationOrder: true },
        tasks: { finalChecks: 'DONE' },
      }).split('||')

      expect(labels[0]).toBe('WARNING')
      expect(labels.length).toBe(4)
      expect(labels).toContain('The offender is on remand')
    })
  })

  describe('getCaProcessingAction', () => {
    test('should show start button to serious offence question when final checks UNSTARTED', () => {
      expect(
        getCaProcessingAction({
          decisions: {},
          tasks: { finalChecks: 'UNSTARTED' },
        })
      ).toEqual({
        text: 'Start now',
        href: '/hdc/finalChecks/seriousOffence/',
        type: 'btn',
      })
    })
    test('should show change link to serious offence question when final checks DONE', () => {
      expect(
        getCaProcessingAction({
          decisions: {},
          tasks: { finalChecks: 'DONE' },
        })
      ).toEqual({
        text: 'Change',
        href: '/hdc/finalChecks/seriousOffence/',
        type: 'link',
      })
    })
    test('should show continue button to serious offence question when final checks STARTED', () => {
      expect(
        getCaProcessingAction({
          decisions: {},
          tasks: { finalChecks: 'STARTED' },
        })
      ).toEqual({
        text: 'Continue',
        href: '/hdc/finalChecks/seriousOffence/',
        type: 'btn',
      })
    })
  })
})
