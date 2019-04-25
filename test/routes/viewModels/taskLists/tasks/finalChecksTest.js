const { getLabel } = require('../../../../../server/routes/viewModels/taskLists/tasks/finalChecks')

describe('final checks task', () => {
  describe('getLabel', () => {
    it('should return Confirmed if task DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { finalChecks: 'DONE' },
        })
      ).to.equal('Confirmed')
    })

    it('should return not completed if task not DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { finalChecks: 'UNSTARTED' },
        })
      ).to.equal('Not completed')
    })

    it('should return warning message when any checks failed', () => {
      expect(
        getLabel({
          decisions: { onRemand: true },
          tasks: { finalChecks: 'DONE' },
        })
      ).to.equal('WARNING||The offender is on remand')
    })

    it('should return multiple warning messages when multiple checks failed', () => {
      const labels = getLabel({
        decisions: { seriousOffence: true, onRemand: true, confiscationOrder: true },
        tasks: { finalChecks: 'DONE' },
      }).split('||')

      expect(labels[0]).to.equal('WARNING')
      expect(labels.length).to.equal(4)
      expect(labels).to.contain('The offender is on remand')
    })
  })
})
