const finalChecks = require('../../../../../server/routes/viewModels/taskLists/tasks/finalChecks')

describe('final checks task', () => {
  describe('review', () => {
    test('should return Confirmed if task DONE', () => {
      expect(
        finalChecks.review({
          decisions: {},
          tasks: { finalChecks: 'DONE' },
          visible: true,
        })
      ).toStrictEqual({
        action: { dataQa: 'review-case', href: '/hdc/finalChecks/seriousOffence/', text: 'Change', type: 'link' },
        label: 'Confirmed',
        title: 'Review case',
        visible: true,
      })
    })

    test('should show start now if task not DONE', () => {
      expect(
        finalChecks.review({
          decisions: {},
          tasks: { finalChecks: 'UNSTARTED' },
          visible: true,
        })
      ).toStrictEqual({
        action: { href: '/hdc/finalChecks/seriousOffence/', text: 'Start now', type: 'btn' },
        label: 'Not completed',
        title: 'Review case',
        visible: true,
      })
    })

    test('should return warning message when any checks failed', () => {
      expect(
        finalChecks.review({
          decisions: { onRemand: true },
          tasks: { finalChecks: 'DONE' },
        }).label
      ).toStrictEqual('WARNING||The offender is on remand')
    })

    test('should return multiple warning messages when multiple checks failed', () => {
      const labels = finalChecks
        .review({
          decisions: { seriousOffence: true, onRemand: true, confiscationOrder: true },
          tasks: { finalChecks: 'DONE' },
        })
        .label.split('||')

      expect(labels[0]).toBe('WARNING')
      expect(labels.length).toBe(4)
      expect(labels).toContain('The offender is on remand')
    })
  })

  describe('view', () => {
    test('should return Confirmed if task DONE', () => {
      expect(
        finalChecks.view({
          decisions: {},
          tasks: { finalChecks: 'DONE' },
          visible: true,
        })
      ).toStrictEqual({
        action: { href: '/hdc/review/finalChecks/', text: 'View', type: 'btn-secondary' },
        label: 'Confirmed',
        title: 'Review case',
        visible: true,
      })
    })

    test('should show start now if task not DONE', () => {
      expect(
        finalChecks.view({
          decisions: {},
          tasks: { finalChecks: 'UNSTARTED' },
          visible: true,
        })
      ).toStrictEqual({
        action: { href: '/hdc/review/finalChecks/', text: 'View', type: 'btn-secondary' },
        label: 'Not completed',
        title: 'Review case',
        visible: true,
      })
    })

    test('should return warning message when any checks failed', () => {
      expect(
        finalChecks.view({
          decisions: { onRemand: true },
          tasks: { finalChecks: 'DONE' },
        }).label
      ).toStrictEqual('WARNING||The offender is on remand')
    })

    test('should return multiple warning messages when multiple checks failed', () => {
      const labels = finalChecks
        .view({
          decisions: { seriousOffence: true, onRemand: true, confiscationOrder: true },
          tasks: { finalChecks: 'DONE' },
        })
        .label.split('||')

      expect(labels[0]).toBe('WARNING')
      expect(labels.length).toBe(4)
      expect(labels).toContain('The offender is on remand')
    })
  })
})
