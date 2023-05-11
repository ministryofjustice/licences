const finalChecks = require('../../../../../server/routes/viewModels/taskLists/tasks/finalChecks')

describe('final checks task', () => {
  describe('review', () => {
    test('should return Confirmed if task DONE', () => {
      expect(
        finalChecks.review({
          decisions: {},
          tasks: { finalChecks: 'DONE' },
        })
      ).toStrictEqual({
        action: { dataQa: 'review-case', href: '/hdc/finalChecks/seriousOffence/', text: 'Change', type: 'link' },
        label: 'Confirmed',
        title: 'Review case',
      })
    })

    test('should show start now if task not DONE', () => {
      expect(
        finalChecks.review({
          decisions: {},
          tasks: { finalChecks: 'UNSTARTED' },
        })
      ).toStrictEqual({
        action: { href: '/hdc/finalChecks/seriousOffence/', text: 'Start now', type: 'btn' },
        label: 'Not completed',
        title: 'Review case',
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
          decisions: {
            seriousOffence: true,
            onRemand: true,
            confiscationOrder: true,
            undulyLenientSentence: true,
            segregation: false,
          },
          tasks: { finalChecks: 'DONE' },
        })
        .label.split('||')

      expect(labels[0]).toBe('WARNING')
      expect(labels.length).toBe(5)
      expect(labels).toContain('The offender is under investigation or been charged for a serious offence in custody')
      expect(labels).toContain('The offender is on remand')
      expect(labels).toContain('The offender is subject to a confiscation order')
      expect(labels).toContain('There is an outstanding unduly lenient sentence application for this offender')
      expect(labels).not.toContain(
        'The offender is currently segregated (for a reason other than their own protection)'
      )
    })
  })

  describe('view', () => {
    test('should return Confirmed if task DONE', () => {
      expect(
        finalChecks.view({
          decisions: {},
          tasks: { finalChecks: 'DONE' },
        })
      ).toStrictEqual({
        action: { href: '/hdc/review/finalChecks/', text: 'View', type: 'btn-secondary' },
        label: 'Confirmed',
        title: 'Review case',
      })
    })

    test('should show start now if task not DONE', () => {
      expect(
        finalChecks.view({
          decisions: {},
          tasks: { finalChecks: 'UNSTARTED' },
        })
      ).toStrictEqual({
        action: { href: '/hdc/review/finalChecks/', text: 'View', type: 'btn-secondary' },
        label: 'Not completed',
        title: 'Review case',
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
          decisions: {
            seriousOffence: true,
            onRemand: true,
            confiscationOrder: true,
            undulyLenientSentence: true,
            segregation: false,
          },
          tasks: { finalChecks: 'DONE' },
        })
        .label.split('||')

      expect(labels[0]).toBe('WARNING')
      expect(labels.length).toBe(5)
      expect(labels).toContain('The offender is under investigation or been charged for a serious offence in custody')
      expect(labels).toContain('The offender is on remand')
      expect(labels).toContain('The offender is subject to a confiscation order')
      expect(labels).toContain('There is an outstanding unduly lenient sentence application for this offender')
      expect(labels).not.toContain(
        'The offender is currently segregated (for a reason other than their own protection)'
      )
    })
  })
})
